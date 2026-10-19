import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

// The session cookie is httpOnly, so the client asks here who is logged in
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    return NextResponse.json({ authenticated: true, ...session })
  } catch (err) {
    console.error("[GET /api/auth/session] error:", err)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
