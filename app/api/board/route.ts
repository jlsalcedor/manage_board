import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data", "bd_petmain.json")

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
    console.log("[v0] GET /api/board - raw length:", raw.length, "path:", DB_PATH)
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    console.log("[v0] GET /api/board error:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    await ensureFile()
    const body = await request.json()
    const content = JSON.stringify(body, null, 2)
    console.log("[v0] POST /api/board - writing", content.length, "bytes to", DB_PATH)
    await fs.writeFile(DB_PATH, content, "utf-8")
    // Verify the write
    const verify = await fs.readFile(DB_PATH, "utf-8")
    console.log("[v0] POST /api/board - verified", verify.length, "bytes")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.log("[v0] POST /api/board error:", err)
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 })
  }
}
