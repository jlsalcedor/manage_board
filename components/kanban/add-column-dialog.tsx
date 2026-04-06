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
import { cn } from "@/lib/utils"

interface AddColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (title: string, color: string) => void
}

const colorOptions = [
  { value: "bg-tag-blue", label: "Azul" },
  { value: "bg-tag-green", label: "Verde" },
  { value: "bg-tag-orange", label: "Naranja" },
  { value: "bg-tag-red", label: "Rojo" },
  { value: "bg-tag-purple", label: "Morado" },
]

export function AddColumnDialog({
  open,
  onOpenChange,
  onAdd,
}: AddColumnDialogProps) {
  const [title, setTitle] = useState("")
  const [selectedColor, setSelectedColor] = useState("bg-tag-blue")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd(title.trim(), selectedColor)
    setTitle("")
    setSelectedColor("bg-tag-blue")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Nueva Columna
          </DialogTitle>
          <DialogDescription>
            Crea una nueva columna para organizar tus historias.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="col-title" className="text-foreground">
              Nombre
            </Label>
            <Input
              id="col-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: QA Testing"
              className="bg-secondary border-border text-foreground"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Color</Label>
            <div className="flex gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "size-8 rounded-full transition-all",
                    color.value,
                    selectedColor === color.value
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                      : "opacity-60 hover:opacity-100"
                  )}
                  aria-label={color.label}
                />
              ))}
            </div>
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
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
