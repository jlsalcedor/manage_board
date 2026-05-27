import { NextResponse } from "next/server"

const VALID_USER = process.env.ADMIN_USER
const VALID_PASSWORD = process.env.ADMIN_PASSWORD

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (username !== VALID_USER || password !== VALID_PASSWORD) {
      return NextResponse.json(
        { error: "Usuario o contrasena invalidos" },
        { status: 401 }
      )
    }

    const expiresAt = Date.now() + SESSION_DURATION_MS
    const token = Buffer.from(
      JSON.stringify({ user: VALID_USER, expiresAt })
    ).toString("base64")

    const response = NextResponse.json({ success: true, user: VALID_USER })

    response.cookies.set("session_token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours in seconds
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    )
  }
}
