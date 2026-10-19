import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { hashPassword, verifyPassword, MIN_PASSWORD_LENGTH } from "@/lib/password"
import { requireSession, setSessionCookie } from "@/lib/session"
import { appendLog } from "@/lib/audit-log"

const DB_PATH = path.join(process.cwd(), "data", "bd_users.json")

export async function POST(request: Request) {
  try {
    const auth = await requireSession({ allowPendingPasswordChange: true })
    if (!auth.ok) return auth.response
    const { session } = auth
    if (session.role !== "user") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { currentPassword, newPassword } = await request.json()
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
        { status: 400 }
      )
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: "La nueva contraseña debe ser distinta a la actual" }, { status: 400 })
    }

    const raw = await fs.readFile(DB_PATH, "utf-8")
    const users = JSON.parse(raw)
    const user = users.find((u: any) => u.username === session.user)

    if (!user?.passwordHash || !(await verifyPassword(String(currentPassword ?? ""), user.passwordHash))) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
    }

    user.passwordHash = await hashPassword(newPassword)
    user.mustChangePassword = false
    // Invalidates every other open session of this user
    user.sessionVersion = (user.sessionVersion ?? 0) + 1
    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf-8")

    await appendLog({ userId: user.username, action: "Cambio de contraseña", details: "El usuario cambió su contraseña" })

    const response = NextResponse.json({ success: true })
    setSessionCookie(response, { user: user.username, role: "user", sessionVersion: user.sessionVersion })
    return response
  } catch (err) {
    console.error("[POST /api/auth/change-password] error:", err)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
