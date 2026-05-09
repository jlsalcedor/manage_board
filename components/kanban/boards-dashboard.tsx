"use client"

import { useState } from "react"
import { KanbanBoardData } from "@/lib/kanban-types"
import { LayoutDashboard, LogOut, Plus, Trash2, Edit2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddBoardDialog } from "./add-board-dialog"
import { EditBoardDialog } from "./edit-board-dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface BoardsDashboardProps {
  boards: KanbanBoardData[]
  onSelectBoard: (boardId: string) => void
  onAddBoard: (title: string) => void
  onDeleteBoard: (boardId: string) => void
  onRenameBoard: (boardId: string, title: string) => void
  onLogout?: () => void
}

export function BoardsDashboard({
  boards,
  onSelectBoard,
  onAddBoard,
  onDeleteBoard,
  onRenameBoard,
  onLogout,
}: BoardsDashboardProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingBoard, setEditingBoard] = useState<{ id: string; title: string } | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground text-balance">
              Mis Tableros
            </h1>
            <p className="text-xs text-muted-foreground">
              Selecciona o crea un tablero para comenzar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            Salir
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Tableros de Proyecto</h2>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="size-4" />
              Nuevo Tablero
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boards.map((board) => {
              const totalColumns = board.columns.length
              const totalTasks = board.columns.reduce((acc, col) => acc + col.stories.length, 0)
              const formattedDate = format(new Date(board.createdAt), "dd MMM yyyy", { locale: es })

              return (
                <div
                  key={board.id}
                  onClick={() => onSelectBoard(board.id)}
                  className="group relative flex flex-col rounded-xl border border-border bg-card p-5 cursor-pointer text-card-foreground shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg line-clamp-1 pr-16">{board.title}</h3>
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingBoard({ id: board.id, title: board.title })
                        }}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`¿Estás seguro de que deseas eliminar el tablero "${board.title}"?`)) {
                            onDeleteBoard(board.id)
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1"></div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex flex-col bg-secondary/50 rounded-md p-2">
                      <span className="font-medium text-foreground">{totalColumns}</span>
                      <span className="text-xs">Columnas</span>
                    </div>
                    <div className="flex flex-col bg-secondary/50 rounded-md p-2">
                      <span className="font-medium text-foreground">{totalTasks}</span>
                      <span className="text-xs">Tareas</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>Creado: {formattedDate}</span>
                  </div>
                </div>
              )
            })}

            <button
              onClick={() => setShowAddDialog(true)}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-kanban-column/50 min-h-[200px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-kanban-column hover:text-foreground"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                <Plus className="size-5" />
              </div>
              <span className="font-medium">Crear nuevo tablero</span>
            </button>
          </div>
        </div>
      </main>

      <AddBoardDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={onAddBoard}
      />

      <EditBoardDialog
        open={!!editingBoard}
        onOpenChange={(open) => { if (!open) setEditingBoard(null) }}
        boardId={editingBoard?.id ?? ""}
        currentTitle={editingBoard?.title ?? ""}
        onRename={onRenameBoard}
      />
    </div>
  )
}
