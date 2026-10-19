import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { appendLog } from "@/lib/audit-log"
import { requireSession } from "@/lib/session"

const DB_PATH = path.join(process.cwd(), "data", "bd_logs.json")

export async function GET() {
  const auth = await requireSession({ role: "admin" })
  if (!auth.ok) return auth.response

  try {
    const raw = await fs.readFile(DB_PATH, "utf-8").catch(() => "[]")
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    console.error("[GET /api/logs] error:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const auth = await requireSession()
  if (!auth.ok) return auth.response

  try {
    // The author always comes from the verified session, never from the body
    const { action, details } = await request.json()
    const log = await appendLog({ userId: auth.session.user, action, details })
    return NextResponse.json({ success: true, log })
  } catch (err) {
    console.error("[POST /api/logs] error:", err)
    return NextResponse.json({ error: "Error al guardar el log" }, { status: 500 })
  }
}
