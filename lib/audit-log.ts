import fs from "fs/promises"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data", "bd_logs.json")
const MAX_LOGS = 1000

async function ensureFile() {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, "[]", "utf-8")
  }
}

// Server-side audit log append, for actions that must be logged regardless of the client
export async function appendLog(entry: { userId: string; action: string; details: string }) {
  await ensureFile()
  const raw = await fs.readFile(DB_PATH, "utf-8")
  const logs = JSON.parse(raw)

  const newLog = { ...entry, id: `log-${Date.now()}`, timestamp: new Date().toISOString() }
  logs.unshift(newLog) // newest first
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS

  await fs.writeFile(DB_PATH, JSON.stringify(logs, null, 2), "utf-8")
  return newLog
}
