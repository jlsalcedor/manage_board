import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const VALID_USER = process.env.ADMIN_USER
const VALID_PASSWORD = process.env.ADMIN_PASSWORD

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours
const DB_PATH = path.join(process.cwd(), "data", "bd_users.json")

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

    let role = ""
    let assignedBoardId = null

    if (username === VALID_USER && password === VALID_PASSWORD) {
      role = "admin"
    } else {
      // Check standard users
      await ensureUsersFile()
      const raw = await fs.readFile(DB_PATH, "utf-8")
      const users = JSON.parse(raw)
      const user = users.find((u: any) => u.username === username && u.password === password)
      
      if (user) {
        role = "user"
        assignedBoardId = user.assignedBoardId
      } else {
        return NextResponse.json(
          { error: "Usuario o contrasena invalidos" },
          { status: 401 }
        )
      }
    }

    const expiresAt = Date.now() + SESSION_DURATION_MS
    const token = Buffer.from(
      JSON.stringify({ user: username, role, assignedBoardId, expiresAt })
    ).toString("base64")

    const response = NextResponse.json({ success: true, user: username, role, assignedBoardId })

    response.cookies.set("session_token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours in seconds
    })

    return response
  } catch (err) {
    console.error("[POST /api/auth/login] error:", err)
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    )
  }
}
