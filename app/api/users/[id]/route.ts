import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data", "bd_users.json")

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await fs.readFile(DB_PATH, "utf-8")
    let users = JSON.parse(raw)
    
    const updates = await request.json()
    
    const userIndex = users.findIndex((u: any) => u.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Prevent changing username to one that already exists
    if (updates.username && updates.username !== users[userIndex].username) {
      if (users.find((u: any) => u.username === updates.username)) {
        return NextResponse.json({ error: "El nombre de usuario ya está en uso" }, { status: 400 })
      }
    }

    users[userIndex] = { ...users[userIndex], ...updates }
    
    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf-8")
    return NextResponse.json({ success: true, user: users[userIndex] })
  } catch (err) {
    console.error("[PUT /api/users/[id]] error:", err)
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const raw = await fs.readFile(DB_PATH, "utf-8")
    let users = JSON.parse(raw)
    
    const newUsers = users.filter((u: any) => u.id !== id)
    if (users.length === newUsers.length) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }
    
    await fs.writeFile(DB_PATH, JSON.stringify(newUsers, null, 2), "utf-8")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/users/[id]] error:", err)
    return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 })
  }
}
