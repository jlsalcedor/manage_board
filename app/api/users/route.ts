import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

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
  try {
    await ensureFile()
    const raw = await fs.readFile(DB_PATH, "utf-8")
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    console.error("[GET /api/users] error:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    await ensureFile()
    const raw = await fs.readFile(DB_PATH, "utf-8")
    const users = JSON.parse(raw)
    
    const newUser = await request.json()
    // Minimal validation
    if (!newUser.username || !newUser.password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Check if username exists
    if (users.find((u: any) => u.username === newUser.username)) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    }

    newUser.id = `user-${Date.now()}`
    newUser.createdAt = new Date().toISOString()
    newUser.role = "user"
    
    users.push(newUser)

    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf-8")
    return NextResponse.json({ success: true, user: newUser })
  } catch (err) {
    console.error("[POST /api/users] error:", err)
    return NextResponse.json({ error: "Error al guardar el usuario" }, { status: 500 })
  }
}
