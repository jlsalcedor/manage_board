"use client"

import { ArrowLeft, LayoutDashboard, Trash2, Search, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BoardHeaderProps {
  title: string
  searchQuery: string
  onSearchChange: (query: string) => void
  totalStories: number
  onReset: () => void
  onBack: () => void
  onLogout?: () => void
}

export function BoardHeader({
  title,
  searchQuery,
  onSearchChange,
  totalStories,
  onReset,
  onBack,
  onLogout,
}: BoardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-9 w-9 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="size-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground text-balance">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {totalStories} historias de usuario
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-3.5" />
          Vaciar columnas
        </Button>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar historias..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="h-6 w-px bg-border" />
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
  )
}
