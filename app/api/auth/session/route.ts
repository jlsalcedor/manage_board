import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))

    if (Date.now() > decoded.expiresAt) {
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
      response.cookies.delete("session_token")
      return response
    }

    return NextResponse.json({
      authenticated: true,
      user: decoded.user,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
