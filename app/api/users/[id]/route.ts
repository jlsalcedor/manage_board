import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { hashPassword, toPublicUser } from "@/lib/password"
import { appendLog } from "@/lib/audit-log"
import { requireSession } from "@/lib/session"

const DB_PATH = path.join(process.cwd(), "data", "bd_users.json")

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession({ role: "admin" })
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const raw = await fs.readFile(DB_PATH, "utf-8")
    let users = JSON.parse(raw)
    
    const { password, passwordHash, mustChangePassword, sessionVersion, id: _id, role, createdAt, ...updates } = await request.json()
    
    const userIndex = users.findIndex((u: any) => u.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Prevent changing username to one that already exists
    if (updates.username && updates.username !== users[userIndex].username) {
      if (users.find((u: any) => u.username === updates.username)) {
        return NextResponse.json({ error: "El nombre de usuario ya está en uso" }, { status: 400 })
      }
    }

    users[userIndex] = { ...users[userIndex], ...updates }

    // Admin reset: no current password required; the user must change it on next login
    const isPasswordReset = typeof password === "string" && password.length > 0
    if (isPasswordReset) {
      users[userIndex].passwordHash = await hashPassword(password)
      delete users[userIndex].password
      users[userIndex].mustChangePassword = true
      // Kicks out any session opened with the old password
      users[userIndex].sessionVersion = (users[userIndex].sessionVersion ?? 0) + 1
    }

    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf-8")

    if (isPasswordReset) {
      await appendLog({
        userId: auth.session.user,
        action: "Restablecimiento de contraseña",
        details: `Se restableció la contraseña del usuario ${users[userIndex].username}`,
      })
    }

    return NextResponse.json({ success: true, user: toPublicUser(users[userIndex]) })
  } catch (err) {
    console.error("[PUT /api/users/[id]] error:", err)
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession({ role: "admin" })
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const raw = await fs.readFile(DB_PATH, "utf-8")
    let users = JSON.parse(raw)
    
    const newUsers = users.filter((u: any) => u.id !== id)
    if (users.length === newUsers.length) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }
    
    await fs.writeFile(DB_PATH, JSON.stringify(newUsers, null, 2), "utf-8")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/users/[id]] error:", err)
    return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 })
  }
}
