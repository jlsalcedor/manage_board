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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Upload, Loader2, ZoomIn, ZoomOut, Maximize } from "lucide-react"
import type { Priority, Tag, UserStory } from "@/lib/kanban-types"
import Image from "next/image"

interface EditStoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  story: UserStory | null
  onEdit: (storyId: string, updated: Partial<UserStory>) => void
}

const priorities: { value: Priority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Critica" },
]

const tags: { value: Tag; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "design", label: "Design" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
]

export function EditStoryDialog({
  open,
  onOpenChange,
  story,
  onEdit,
}: EditStoryDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [assignee, setAssignee] = useState("")
  const [points, setPoints] = useState("3")
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (story) {
      setTitle(story.title)
      setDescription(story.description)
      setPriority(story.priority)
      setSelectedTags(story.tags)
      setAssignee(story.assignee)
      setPoints(story.points.toString())
      setExistingImages(story.images || [])
      setNewImages([])
    }
  }, [story])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      if (existingImages.length + newImages.length + filesArray.length > 5) {
        alert("Máximo 5 imágenes permitidas en total.")
        return
      }
      setNewImages((prev) => [...prev, ...filesArray].slice(0, 5 - existingImages.length))
    }
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !story) return

    setIsUploading(true)

    try {
      let finalImages = [...existingImages]

      // Upload new images
      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach((img) => formData.append("images", img))
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (res.ok) {
          const data = await res.json()
          if (data.urls) {
            finalImages = [...finalImages, ...data.urls]
          }
        }
      }

      onEdit(story.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        tags: selectedTags.length > 0 ? selectedTags : ["feature"],
        assignee: assignee.trim() || "Sin asignar",
        points: parseInt(points) || 3,
        images: finalImages,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar historia:", error)
      alert("Error al actualizar la historia.")
    } finally {
      setIsUploading(false)
    }
  }

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  if (!story) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Editar Historia de Usuario
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de la historia de usuario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-foreground">
              Titulo
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementar login con Google"
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-foreground">
              Descripcion
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Como usuario quiero..."
              className="bg-secondary border-border text-foreground resize-none min-h-[100px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">
              Imágenes ({existingImages.length + newImages.length}/5)
            </Label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((src, idx) => (
                <div 
                  key={`exist-${idx}`} 
                  className="relative size-16 group rounded-md overflow-hidden border border-border cursor-pointer"
                  onClick={() => setPreviewImage(src)}
                >
                  <Image src={src} alt="Uploaded" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeExistingImage(idx); }}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {newImages.map((file, idx) => (
                <div 
                  key={`new-${idx}`} 
                  className="relative size-16 group rounded-md overflow-hidden border border-border cursor-pointer"
                  onClick={() => setPreviewImage(URL.createObjectURL(file))}
                >
                  {/* Utiliza un object url estático temporal para la previsualización */}
                  <Image src={URL.createObjectURL(file)} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeNewImage(idx); }}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {existingImages.length + newImages.length < 5 && (
                <label className="flex size-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-secondary hover:bg-secondary/80">
                  <Upload className="size-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Opcional. Formatos soportados: JPG, PNG, GIF.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Prioridad</Label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as Priority)}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="points" className="text-foreground">
                Puntos
              </Label>
              <Select value={points} onValueChange={setPoints}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 8, 13, 21].map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} pts
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag.value)
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="assignee" className="text-foreground">
              Asignado a
            </Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Nombre del responsable"
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim() || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={!!previewImage} onOpenChange={(open) => {
      if (!open) {
        setPreviewImage(null)
        setZoom(1)
      }
    }}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-transparent border-none shadow-none flex flex-col">
        <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
        
        {/* Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/60 p-2 rounded-full backdrop-blur-md">
          <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setZoom(z => Math.max(z - 0.5, 1))}>
            <ZoomOut className="size-5" />
          </Button>
          <div className="text-white/80 text-xs font-mono w-12 text-center">
            {Math.round(zoom * 100)}%
          </div>
          <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setZoom(z => Math.min(z + 0.5, 4))}>
            <ZoomIn className="size-5" />
          </Button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setZoom(1)}>
            <Maximize className="size-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full z-50"
          onClick={() => { setPreviewImage(null); setZoom(1); }}
        >
          <X className="size-6" />
        </Button>

        <div className="w-full h-full overflow-auto bg-black/90 rounded-2xl flex">
          {previewImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={previewImage} 
              alt="Preview full" 
              className="m-auto transition-all duration-200 ease-out shadow-2xl"
              style={{ 
                width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
                height: 'auto',
                maxHeight: zoom === 1 ? '90vh' : 'none',
                maxWidth: zoom === 1 ? '100%' : 'none',
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
