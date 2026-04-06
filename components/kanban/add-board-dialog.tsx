"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (title: string) => void
}

export function AddBoardDialog({
  open,
  onOpenChange,
  onAdd,
}: AddBoardDialogProps) {
  const [title, setTitle] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd(title.trim())
    setTitle("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Nuevo Tablero
          </DialogTitle>
          <DialogDescription>
            Ingresa un nombre para tu nuevo tablero de Kanban.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="board-title" className="text-foreground">
              Nombre del Tablero
            </Label>
            <Input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Proyecto Alpha"
              className="bg-secondary border-border text-foreground"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Crear Tablero
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
