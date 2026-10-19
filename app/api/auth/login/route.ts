import { NextResponse } from "next/server"
import fs from "fs/promises"
import { timingSafeEqual } from "crypto"
import path from "path"
import { hashPassword, verifyPassword } from "@/lib/password"
import { setSessionCookie } from "@/lib/session"

const VALID_USER = process.env.ADMIN_USER
const VALID_PASSWORD = process.env.ADMIN_PASSWORD

const DB_PATH = path.join(process.cwd(), "data", "bd_users.json")

function safeEqual(a: unknown, b: string | undefined) {
  if (typeof a !== "string" || !b) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

async function ensureUsersFile() {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, "[]", "utf-8")
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    let role: "admin" | "user"
    let assignedBoardIds: string[] = []
    let mustChangePassword = false
    let sessionVersion = 0

    if (safeEqual(username, VALID_USER) && safeEqual(password, VALID_PASSWORD)) {
      role = "admin"
    } else {
      // Check standard users
      await ensureUsersFile()
      const raw = await fs.readFile(DB_PATH, "utf-8")
      const users = JSON.parse(raw)
      const user = users.find((u: any) => u.username === username)

      let isValid = false
      if (user?.passwordHash) {
        isValid = await verifyPassword(password, user.passwordHash)
      } else if (user?.password !== undefined && user.password === password) {
        // Legacy plaintext record: migrate to a hash and force a password change
        isValid = true
        user.passwordHash = await hashPassword(password)
        delete user.password
        user.mustChangePassword = true
        await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf-8")
      }

      if (!isValid) {
        return NextResponse.json(
          { error: "Usuario o contrasena invalidos" },
          { status: 401 }
        )
      }

      role = "user"
      assignedBoardIds = user.assignedBoardIds || []
      mustChangePassword = user.mustChangePassword === true
      sessionVersion = user.sessionVersion ?? 0
    }

    const response = NextResponse.json({ success: true, user: username, role, assignedBoardIds, mustChangePassword })
    setSessionCookie(response, { user: username, role, sessionVersion })
    return response
  } catch (err) {
    console.error("[POST /api/auth/login] error:", err)
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    )
  }
}
