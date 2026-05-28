"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { LoginForm } from "./login-form"
import { useKanbanStorage } from "@/hooks/use-kanban-storage"
import { BoardsDashboard } from "@/components/kanban/boards-dashboard"
import { API_URL } from "@/lib/utils"

const KanbanBoard = dynamic(
  () =>
    import("@/components/kanban/kanban-board").then((mod) => mod.KanbanBoard),
  { ssr: false }
)

function getSessionFromCookie(): boolean {
  try {
    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = decodeURIComponent(value)
        return acc
      },
      {} as Record<string, string>
    )

    const token = cookies["session_token"]
    if (!token) return false

    const decoded = JSON.parse(atob(token))
    if (!decoded.user || !decoded.expiresAt) return false

    return Date.now() < decoded.expiresAt
  } catch {
    return false
  }
}

function MainApp({ onLogout }: { onLogout: () => void }) {
  const { boards, isLoading, addBoard, deleteBoard, renameBoard, updateBoardColumns } = useKanbanStorage()
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando tableros...</p>
        </div>
      </div>
    )
  }

  if (selectedBoardId) {
    const selectedBoard = boards.find(b => b.id === selectedBoardId)
    if (!selectedBoard) {
      setSelectedBoardId(null)
      return null
    }

    return (
      <KanbanBoard 
        board={selectedBoard} 
        updateColumns={(updater) => updateBoardColumns(selectedBoardId, updater)} 
        onBack={() => setSelectedBoardId(null)}
        onLogout={onLogout} 
      />
    )
  }

  return (
    <BoardsDashboard 
      boards={boards} 
      onSelectBoard={setSelectedBoardId} 
      onAddBoard={addBoard} 
      onDeleteBoard={deleteBoard} 
      onRenameBoard={renameBoard} 
      onLogout={onLogout} 
    />
  )
}

export function AppShell() {
  const [authState, setAuthState] = useState<
    "loading" | "login" | "authenticated"
  >("loading")

  const checkSession = useCallback(() => {
    const isValid = getSessionFromCookie()
    setAuthState(isValid ? "authenticated" : "login")
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const handleLogout = useCallback(() => {
    document.cookie =
      "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {})
    setAuthState("login")
  }, [])

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verificando sesion...
          </p>
        </div>
      </div>
    )
  }

  if (authState === "login") {
    return <LoginForm onLogin={() => setAuthState("authenticated")} />
  }

  return <MainApp onLogout={handleLogout} />
}
