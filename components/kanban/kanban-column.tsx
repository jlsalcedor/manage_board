"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { MoreHorizontal, Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StoryCard } from "./story-card"
import type { KanbanColumn as KanbanColumnType, UserStory } from "@/lib/kanban-types"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  column: KanbanColumnType
  onAddStory: (columnId: string) => void
  onDeleteStory: (storyId: string) => void
  onDeleteColumn: (columnId: string) => void
  onRenameColumn: (columnId: string, newTitle: string) => void
  onEditStory: (story: UserStory) => void
}

export function KanbanColumn({
  column,
  onAddStory,
  onDeleteStory,
  onDeleteColumn,
  onRenameColumn,
  onEditStory,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  const totalPoints = column.stories.reduce((sum, s) => sum + s.points, 0)

  const handleRename = () => {
    if (editTitle.trim()) {
      onRenameColumn(column.id, editTitle.trim())
    } else {
      setEditTitle(column.title)
    }
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        "flex h-full w-72 shrink-0 flex-col rounded-xl bg-kanban-column border border-border transition-colors",
        isOver && "border-primary/50 bg-kanban-column/80"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn("size-2.5 rounded-full shrink-0", column.color)} />
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  if (e.key === "Escape") {
                    setEditTitle(column.title)
                    setIsEditing(false)
                  }
                }}
                className="h-6 text-xs bg-secondary border-border px-1.5"
                autoFocus
              />
              <button
                onClick={handleRename}
                className="text-tag-green hover:text-tag-green/80"
              >
                <Check className="size-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditTitle(column.title)
                  setIsEditing(false)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-sm font-semibold text-kanban-column-foreground truncate">
                {column.title}
              </span>
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                {column.stories.length}
              </span>
            </>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground mr-1">
              {totalPoints} pts
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-6 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="size-3.5" />
                  Renombrar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddStory(column.id)}>
                  <Plus className="size-3.5" />
                  Agregar historia
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteColumn(column.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar columna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 px-2 pb-2">
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 p-1 min-h-[60px]"
        >
          <SortableContext
            items={column.stories.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onDelete={onDeleteStory}
                onEdit={onEditStory}
              />
            ))}
          </SortableContext>
        </div>
      </ScrollArea>

      {/* Add button */}
      <div className="px-3 pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddStory(column.id)}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary text-xs"
        >
          <Plus className="size-3.5" />
          Agregar historia
        </Button>
      </div>
    </div>
  )
}
