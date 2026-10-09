import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Images are stored outside public/ because `next start` only serves files
// that existed in public/ at build time. Legacy uploads in public/uploads are
// still read as a fallback.
const UPLOAD_DIRS = [
  path.join(process.cwd(), "data", "uploads"),
  path.join(process.cwd(), "public", "uploads"),
]

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const filename = path.basename(file)

  for (const dir of UPLOAD_DIRS) {
    try {
      const buffer = await fs.readFile(path.join(dir, filename))
      const contentType = MIME_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream"
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    } catch {
      // try next directory
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}
