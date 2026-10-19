import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { hashPassword, toPublicUser } from "@/lib/password"
import { requireSession } from "@/lib/session"

const DB_PATH = path.join(process.cwd(), "data", "bd_users.json")

async function ensureFile() {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, "[]", "utf-8")
  }
}

export async function GET() {
  const auth = await requireSession({ role: "admin" })
  if (!auth.ok) return auth.response

  try {
    await ensureFile()
    const raw = await fs.readFile(DB_PATH, "utf-8")
    const data = JSON.parse(raw)
    return NextResponse.json(data.map(toPublicUser))
  } catch (err) {
    console.error("[GET /api/users] error:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const auth = await requireSession({ role: "admin" })
  if (!auth.ok) return auth.response

  try {
    await ensureFile()
    const raw = await fs.readFile(DB_PATH, "utf-8")
    const users = JSON.parse(raw)
    
    const { username, password, assignedBoardIds } = await request.json()
    // Minimal validation
    if (!username || !password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Check if username exists
    if (users.find((u: any) => u.username === username)) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username,
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      assignedBoardIds: assignedBoardIds || [],
      role: "user",
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf-8")
    return NextResponse.json({ success: true, user: toPublicUser(newUser) })
  } catch (err) {
    console.error("[POST /api/users] error:", err)
    return NextResponse.json({ error: "Error al guardar el usuario" }, { status: 500 })
  }
}
