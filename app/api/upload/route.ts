import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 files allowed" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    
    // Ensure upload directory exists
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    const savedUrls: string[] = []

    for (const file of files) {
      // Basic validation for images
      if (!file.type.startsWith("image/")) {
        continue
      }
      
      const buffer = Buffer.from(await file.arrayBuffer())
      // Sanitize filename and make it unique
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const filepath = path.join(uploadDir, filename)
      
      await fs.writeFile(filepath, buffer)
      savedUrls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({ urls: savedUrls })
  } catch (error) {
    console.error("[UPLOAD ERROR]", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
