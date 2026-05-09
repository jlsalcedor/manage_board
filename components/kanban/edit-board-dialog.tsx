"use client"

import { useState, useEffect } from "react"
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

interface EditBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  currentTitle: string
  onRename: (boardId: string, newTitle: string) => void
}

export function EditBoardDialog({
  open,
  onOpenChange,
  boardId,
  currentTitle,
  onRename,
}: EditBoardDialogProps) {
  const [title, setTitle] = useState(currentTitle)

  useEffect(() => {
    if (open) {
      setTitle(currentTitle)
    }
  }, [open, currentTitle])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onRename(boardId, title.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Editar Tablero
          </DialogTitle>
          <DialogDescription>
            Modifica el nombre del tablero.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="board-title-edit" className="text-foreground">
              Nombre del Tablero
            </Label>
            <Input
              id="board-title-edit"
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
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
