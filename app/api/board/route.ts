import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { requireSession } from "@/lib/session"
import type { AppState } from "@/lib/kanban-types"

const DB_PATH = path.join(process.cwd(), "data", "bd_board.json")

async function ensureFile() {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, "[]", "utf-8")
  }
}

async function readBoards(): Promise<AppState> {
  await ensureFile()
  const raw = await fs.readFile(DB_PATH, "utf-8")
  return JSON.parse(raw)
}

export async function GET() {
  const auth = await requireSession()
  if (!auth.ok) return auth.response
  const { session } = auth

  try {
    const boards = await readBoards()
    // Standard users only receive the boards assigned to them
    const visible =
      session.role === "admin" ? boards : boards.filter((b) => session.assignedBoardIds.includes(b.id))
    return NextResponse.json(visible)
  } catch (err) {
    console.error("[GET /api/board] error:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const auth = await requireSession()
  if (!auth.ok) return auth.response
  const { session } = auth

  try {
    const body = await request.json()
    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Formato inválido" }, { status: 400 })
    }

    let next: AppState = body
    if (session.role === "user") {
      // Standard users can only change the columns/stories of their assigned boards;
      // they cannot create, delete or rename boards, nor touch anyone else's
      const incoming = new Map((body as AppState).map((b) => [b.id, b]))
      const current = await readBoards()
      next = current.map((board) => {
        const update = incoming.get(board.id)
        if (!update || !session.assignedBoardIds.includes(board.id) || !Array.isArray(update.columns)) {
          return board
        }
        return { ...board, columns: update.columns }
      })
    }

    await ensureFile()
    await fs.writeFile(DB_PATH, JSON.stringify(next, null, 2), "utf-8")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[POST /api/board] error:", err)
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 })
  }
}
