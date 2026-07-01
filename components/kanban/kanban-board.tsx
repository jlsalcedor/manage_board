"use client"

import { useCallback, useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable"
import { Plus, GripHorizontal } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { BoardHeader } from "./board-header"
import { KanbanColumn as KanbanColumnComponent } from "./kanban-column"
import { AddStoryDialog } from "./add-story-dialog"
import { EditStoryDialog } from "./edit-story-dialog"
import { AddColumnDialog } from "./add-column-dialog"
import type { UserStory, KanbanBoardData, KanbanColumn } from "@/lib/kanban-types"
import { useLogs } from "@/hooks/use-logs"

interface KanbanBoardProps {
  board: KanbanBoardData
  updateColumns: (updater: KanbanColumn[] | ((prev: KanbanColumn[]) => KanbanColumn[])) => void
  onBack?: () => void
  onLogout?: () => void
  session: any
}

export function KanbanBoard({ board, updateColumns, onBack, onLogout, session }: KanbanBoardProps) {
  const [activeStory, setActiveStory] = useState<UserStory | null>(null)
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [addStoryColumnId, setAddStoryColumnId] = useState<string | null>(null)
  const [editingStory, setEditingStory] = useState<UserStory | null>(null)
  const [showAddColumn, setShowAddColumn] = useState(false)
  
  const { createLog } = useLogs()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const columns = board.columns

  const totalStories = useMemo(
    () => columns.reduce((sum, col) => sum + col.stories.length, 0),
    [columns]
  )

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return columns
    const query = searchQuery.toLowerCase()
    return columns.map((col) => ({
      ...col,
      stories: col.stories.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.assignee.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      ),
    }))
  }, [columns, searchQuery])

  const columnIds = useMemo(() => filteredColumns.map((col) => col.id), [filteredColumns])

  const findColumnByStoryId = useCallback(
    (storyId: string) => {
      return columns.find((col) =>
        col.stories.some((s) => s.id === storyId)
      )
    },
    [columns]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event

      if (active.data.current?.type === "column") {
        setActiveColumn(active.data.current.column)
        return
      }

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

      if (active.data.current?.type === "column") return

      const activeId = active.id as string
      const overId = over.id as string

      const activeColumn = findColumnByStoryId(activeId)
      if (!activeColumn) return

      // Check if we're over a column directly
      const overColumn = columns.find((col) => col.id === overId)
      // Or over a story in a column
      const overStoryColumn = findColumnByStoryId(overId)

      const targetColumn = overColumn || overStoryColumn
      if (!targetColumn || activeColumn.id === targetColumn.id) return

      updateColumns((prev) => {
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

        // Log the action (without waiting)
        createLog({
          userId: session.user,
          action: "Movimiento de historia",
          details: `Historia "${story.title}" movida de "${newBoard[activeColIndex].title}" a "${newBoard[targetColIndex].title}"`
        })

        return newBoard
      })
    },
    [columns, findColumnByStoryId, updateColumns]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveStory(null)
      setActiveColumn(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      if (activeId === overId) return

      if (active.data.current?.type === "column") {
        updateColumns((prev) => {
          const oldIndex = prev.findIndex((c) => c.id === activeId)
          const newIndex = prev.findIndex((c) => c.id === overId)
          return arrayMove(prev, oldIndex, newIndex)
        })
        return
      }

      // Reorder within the same column
      const column = findColumnByStoryId(activeId)
      if (!column) return

      const overInSameColumn = column.stories.some((s) => s.id === overId)
      if (!overInSameColumn) return

      updateColumns((prev) => {
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
    [findColumnByStoryId, updateColumns]
  )

  const handleAddStory = useCallback(
    (storyData: Omit<UserStory, "id" | "createdAt">) => {
      if (!addStoryColumnId) return

      const newStory: UserStory = {
        ...storyData,
        id: `story-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      }

      updateColumns((prev) =>
        prev.map((col) =>
          col.id === addStoryColumnId
            ? { ...col, stories: [...col.stories, newStory] }
            : col
        )
      )
      
      createLog({
        userId: session.user,
        action: "Creación de historia",
        details: `Nueva historia "${newStory.title}"`
      })

      setAddStoryColumnId(null)
    },
    [addStoryColumnId, updateColumns, createLog, session]
  )

  const handleDeleteStory = useCallback((storyId: string) => {
    let deletedTitle = ""
    updateColumns((prev) =>
      prev.map((col) => {
        const story = col.stories.find(s => s.id === storyId)
        if (story) deletedTitle = story.title
        return {
          ...col,
          stories: col.stories.filter((s) => s.id !== storyId),
        }
      })
    )
    if (deletedTitle) {
      createLog({
        userId: session.user,
        action: "Eliminación de historia",
        details: `Historia eliminada: "${deletedTitle}"`
      })
    }
  }, [updateColumns, createLog, session])

  const handleEditStory = useCallback(
    (storyId: string, updatedData: Partial<UserStory>) => {
      updateColumns((prev) =>
        prev.map((col) => {
          const storyIndex = col.stories.findIndex((s) => s.id === storyId)
          if (storyIndex >= 0) {
            const newStories = [...col.stories]
            newStories[storyIndex] = { ...newStories[storyIndex], ...updatedData }
            return { ...col, stories: newStories }
          }
          return col
        })
      )
      
      createLog({
        userId: session.user,
        action: "Edición de historia",
        details: `Historia editada (ID: ${storyId})`
      })

      setEditingStory(null)
    },
    [updateColumns, createLog, session]
  )

  const handleAddColumn = useCallback((title: string, color: string) => {
    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      title,
      color,
      stories: [],
    }
    updateColumns((prev) => [...prev, newColumn])
  }, [updateColumns])

  const handleDeleteColumn = useCallback((columnId: string) => {
    updateColumns((prev) => prev.filter((col) => col.id !== columnId))
  }, [updateColumns])

  const handleRenameColumn = useCallback(
    (columnId: string, newTitle: string) => {
      updateColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, title: newTitle } : col
        )
      )
    },
    [updateColumns]
  )

  const handleResetBoard = useCallback(() => {
    updateColumns((prev) => prev.map(col => ({ ...col, stories: [] })))
  }, [updateColumns])

  return (
    <div className="flex h-screen flex-col bg-background">
      <BoardHeader
        title={board.title}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalStories={totalStories}
        onReset={handleResetBoard}
        onBack={onBack}
        onLogout={onLogout}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={(args) => {
          // Primero intentamos ver dónde está el puntero
          const pointerCollisions = pointerWithin(args)
          
          if (pointerCollisions.length > 0) {
            return pointerCollisions
          }
          
          // Si no, caemos en la intersección de rectángulos
          return rectIntersection(args)
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1">
          <div className="flex gap-4 p-6 h-[calc(100vh-73px)]">
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {filteredColumns.map((column) => (
                <KanbanColumnComponent
                  key={column.id}
                  column={column}
                  onAddStory={(colId) => setAddStoryColumnId(colId)}
                  onDeleteStory={handleDeleteStory}
                  onDeleteColumn={handleDeleteColumn}
                  onRenameColumn={handleRenameColumn}
                  onEditStory={setEditingStory}
                  session={session}
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            {session.role !== "user" && (
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex h-fit w-72 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-kanban-column/50 px-4 py-8 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-kanban-column hover:text-foreground"
              >
                <Plus className="size-4" />
                Agregar columna
              </button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeColumn ? (
            <div className="flex h-min min-h-60 w-72 shrink-0 flex-col rounded-xl bg-kanban-column border-2 border-primary/50 opacity-80 shadow-2xl rotate-2">
              <div className="flex items-center px-3 py-3 gap-2 border-b border-border/50">
                <GripHorizontal className="size-4 text-muted-foreground" />
                <div className={`size-2.5 rounded-full shrink-0 ${activeColumn.color}`} />
                <span className="text-sm font-semibold text-kanban-column-foreground truncate">
                  {activeColumn.title}
                </span>
              </div>
            </div>
          ) : activeStory ? (
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

      <EditStoryDialog
        open={!!editingStory}
        onOpenChange={(open) => {
          if (!open) setEditingStory(null)
        }}
        story={editingStory}
        onEdit={handleEditStory}
      />

      <AddColumnDialog
        open={showAddColumn}
        onOpenChange={setShowAddColumn}
        onAdd={handleAddColumn}
      />
    </div>
  )
}
