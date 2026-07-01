import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data", "bd_logs.json")

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
    console.error("[GET /api/logs] error:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    await ensureFile()
    const raw = await fs.readFile(DB_PATH, "utf-8")
    const logs = JSON.parse(raw)
    
    const newLog = await request.json()
    newLog.id = `log-${Date.now()}`
    newLog.timestamp = new Date().toISOString()
    
    logs.unshift(newLog) // Add to the beginning so newest are first
    
    // Optional: Keep only the latest 1000 logs to prevent file bloat
    if (logs.length > 1000) {
      logs.length = 1000;
    }

    await fs.writeFile(DB_PATH, JSON.stringify(logs, null, 2), "utf-8")
    return NextResponse.json({ success: true, log: newLog })
  } catch (err) {
    console.error("[POST /api/logs] error:", err)
    return NextResponse.json({ error: "Error al guardar el log" }, { status: 500 })
  }
}
