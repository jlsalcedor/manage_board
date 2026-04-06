"use client"

import { useCallback, useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { BoardHeader } from "./board-header"
import { KanbanColumn } from "./kanban-column"
import { AddStoryDialog } from "./add-story-dialog"
import { AddColumnDialog } from "./add-column-dialog"
import { useKanbanStorage } from "@/hooks/use-kanban-storage"
import type { UserStory } from "@/lib/kanban-types"

interface KanbanBoardProps {
  onLogout?: () => void
}

export function KanbanBoard({ onLogout }: KanbanBoardProps) {
  const { board, setBoard, resetBoard, isLoading } = useKanbanStorage()
  const [activeStory, setActiveStory] = useState<UserStory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [addStoryColumnId, setAddStoryColumnId] = useState<string | null>(null)
  const [showAddColumn, setShowAddColumn] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const totalStories = useMemo(
    () => board.reduce((sum, col) => sum + col.stories.length, 0),
    [board]
  )

  const filteredBoard = useMemo(() => {
    if (!searchQuery.trim()) return board
    const query = searchQuery.toLowerCase()
    return board.map((col) => ({
      ...col,
      stories: col.stories.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.assignee.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      ),
    }))
  }, [board, searchQuery])

  const findColumnByStoryId = useCallback(
    (storyId: string) => {
      return board.find((col) =>
        col.stories.some((s) => s.id === storyId)
      )
    },
    [board]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const column = findColumnByStoryId(active.id as string)
      if (column) {
        const story = column.stories.find((s) => s.id === active.id)
        if (story) setActiveStory(story)
      }
    },
    [findColumnByStoryId]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeColumn = findColumnByStoryId(activeId)
      if (!activeColumn) return

      // Check if we're over a column directly
      const overColumn = board.find((col) => col.id === overId)
      // Or over a story in a column
      const overStoryColumn = findColumnByStoryId(overId)

      const targetColumn = overColumn || overStoryColumn
      if (!targetColumn || activeColumn.id === targetColumn.id) return

      setBoard((prev) => {
        const activeColIndex = prev.findIndex((c) => c.id === activeColumn.id)
        const targetColIndex = prev.findIndex((c) => c.id === targetColumn.id)

        const story = prev[activeColIndex].stories.find(
          (s) => s.id === activeId
        )
        if (!story) return prev

        const newBoard = [...prev]
        newBoard[activeColIndex] = {
          ...newBoard[activeColIndex],
          stories: newBoard[activeColIndex].stories.filter(
            (s) => s.id !== activeId
          ),
        }

        // Find position in target column
        const overIndex = newBoard[targetColIndex].stories.findIndex(
          (s) => s.id === overId
        )

        const insertIndex = overIndex >= 0 ? overIndex : newBoard[targetColIndex].stories.length
        const newStories = [...newBoard[targetColIndex].stories]
        newStories.splice(insertIndex, 0, story)

        newBoard[targetColIndex] = {
          ...newBoard[targetColIndex],
          stories: newStories,
        }

        return newBoard
      })
    },
    [board, findColumnByStoryId]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveStory(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      if (activeId === overId) return

      // Reorder within the same column
      const column = findColumnByStoryId(activeId)
      if (!column) return

      const overInSameColumn = column.stories.some((s) => s.id === overId)
      if (!overInSameColumn) return

      setBoard((prev) => {
        const colIndex = prev.findIndex((c) => c.id === column.id)
        const oldIndex = prev[colIndex].stories.findIndex(
          (s) => s.id === activeId
        )
        const newIndex = prev[colIndex].stories.findIndex(
          (s) => s.id === overId
        )

        const newStories = [...prev[colIndex].stories]
        const [moved] = newStories.splice(oldIndex, 1)
        newStories.splice(newIndex, 0, moved)

        const newBoard = [...prev]
        newBoard[colIndex] = { ...newBoard[colIndex], stories: newStories }
        return newBoard
      })
    },
    [findColumnByStoryId]
  )

  const handleAddStory = useCallback(
    (storyData: Omit<UserStory, "id" | "createdAt">) => {
      if (!addStoryColumnId) return

      const newStory: UserStory = {
        ...storyData,
        id: `story-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      }

      setBoard((prev) =>
        prev.map((col) =>
          col.id === addStoryColumnId
            ? { ...col, stories: [...col.stories, newStory] }
            : col
        )
      )
      setAddStoryColumnId(null)
    },
    [addStoryColumnId]
  )

  const handleDeleteStory = useCallback((storyId: string) => {
    setBoard((prev) =>
      prev.map((col) => ({
        ...col,
        stories: col.stories.filter((s) => s.id !== storyId),
      }))
    )
  }, [])

  const handleAddColumn = useCallback((title: string, color: string) => {
    const newColumn = {
      id: `col-${Date.now()}`,
      title,
      color,
      stories: [],
    }
    setBoard((prev) => [...prev, newColumn])
  }, [])

  const handleDeleteColumn = useCallback((columnId: string) => {
    setBoard((prev) => prev.filter((col) => col.id !== columnId))
  }, [])

  const handleRenameColumn = useCallback(
    (columnId: string, newTitle: string) => {
      setBoard((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, title: newTitle } : col
        )
      )
    },
    []
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando tablero...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <BoardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalStories={totalStories}
        onReset={resetBoard}
        onLogout={onLogout}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1">
          <div className="flex gap-4 p-6 h-[calc(100vh-73px)]">
            {filteredBoard.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddStory={(colId) => setAddStoryColumnId(colId)}
                onDeleteStory={handleDeleteStory}
                onDeleteColumn={handleDeleteColumn}
                onRenameColumn={handleRenameColumn}
              />
            ))}

            {/* Add Column Button */}
            <button
              onClick={() => setShowAddColumn(true)}
              className="flex h-fit w-72 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-kanban-column/50 px-4 py-8 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-kanban-column hover:text-foreground"
            >
              <Plus className="size-4" />
              Agregar columna
            </button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeStory ? (
            <div className="w-64 rounded-lg bg-kanban-card border border-primary/30 p-3 shadow-2xl rotate-3">
              <h4 className="text-sm font-medium text-kanban-card-foreground mb-1">
                {activeStory.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {activeStory.description}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddStoryDialog
        open={!!addStoryColumnId}
        onOpenChange={(open) => {
          if (!open) setAddStoryColumnId(null)
        }}
        onAdd={handleAddStory}
      />

      <AddColumnDialog
        open={showAddColumn}
        onOpenChange={setShowAddColumn}
        onAdd={handleAddColumn}
      />
    </div>
  )
}
