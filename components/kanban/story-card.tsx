"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, Edit2, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { UserStory, Priority, Tag } from "@/lib/kanban-types"
import { cn } from "@/lib/utils"
import Image from "next/image"

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Baja", className: "bg-tag-green/20 text-tag-green border-tag-green/30" },
  medium: { label: "Media", className: "bg-tag-blue/20 text-tag-blue border-tag-blue/30" },
  high: { label: "Alta", className: "bg-tag-orange/20 text-tag-orange border-tag-orange/30" },
  critical: { label: "Critica", className: "bg-tag-red/20 text-tag-red border-tag-red/30" },
}

const tagConfig: Record<Tag, { label: string; className: string }> = {
  frontend: { label: "Frontend", className: "bg-tag-blue/15 text-tag-blue border-tag-blue/20" },
  backend: { label: "Backend", className: "bg-tag-green/15 text-tag-green border-tag-green/20" },
  design: { label: "Design", className: "bg-tag-purple/15 text-tag-purple border-tag-purple/20" },
  bug: { label: "Bug", className: "bg-tag-red/15 text-tag-red border-tag-red/20" },
  feature: { label: "Feature", className: "bg-tag-orange/15 text-tag-orange border-tag-orange/20" },
}

interface StoryCardProps {
  story: UserStory
  onDelete: (storyId: string) => void
  onEdit: (story: UserStory) => void
}

export function StoryCard({ story, onDelete, onEdit }: StoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: story.id,
    data: {
      type: "story",
      story,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = priorityConfig[story.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg bg-kanban-card border border-border p-3 transition-colors hover:bg-kanban-card-hover",
        isDragging && "opacity-50 rotate-2 shadow-xl"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Arrastrar historia"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium text-kanban-card-foreground leading-snug">
              {story.title}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(story)}
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                aria-label="Editar historia"
              >
                <Edit2 className="size-3.5" />
              </button>
              <button
                onClick={() => onDelete(story.id)}
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label="Eliminar historia"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
          
          {/* Thumbnails if images exist */}
          {story.images && story.images.length > 0 && (
            <div className="relative w-full h-24 mb-3 rounded-md overflow-hidden bg-secondary border border-border group-hover:border-primary/20 transition-colors">
              <Image 
                src={story.images[0]} 
                alt="Story thumbnail" 
                fill 
                className="object-cover"
              />
              {story.images.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-sm flex items-center gap-1 backdrop-blur-sm">
                  <ImageIcon className="size-3" />
                  +{story.images.length - 1}
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {story.description}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", priority.className)}
            >
              {priority.label}
            </Badge>
            {story.tags.map((tag) => {
              const config = tagConfig[tag]
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", config.className)}
                >
                  {config.label}
                </Badge>
              )
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
                {story.assignee.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {story.assignee}
              </span>
            </div>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {story.points} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
