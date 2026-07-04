"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { LoginForm } from "./login-form"
import { useKanbanStorage } from "@/hooks/use-kanban-storage"
import { BoardsDashboard } from "@/components/kanban/boards-dashboard"
import { API_URL } from "@/lib/utils"
import { AdminPanel } from "@/components/admin/admin-panel"

const KanbanBoard = dynamic(
  () =>
    import("@/components/kanban/kanban-board").then((mod) => mod.KanbanBoard),
  { ssr: false }
)

function getSessionFromCookie(): { isValid: boolean; user?: string; role?: string; assignedBoardIds?: string[] } {
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
    if (!token) return { isValid: false }

    const decoded = JSON.parse(atob(token))
    if (!decoded.user || !decoded.expiresAt) return { isValid: false }

    const isValid = Date.now() < decoded.expiresAt
    return { isValid, user: decoded.user, role: decoded.role, assignedBoardIds: decoded.assignedBoardIds || [] }
  } catch {
    return { isValid: false }
  }
}

function MainApp({ onLogout, session }: { onLogout: () => void, session: any }) {
  const { boards: allBoards, isLoading, addBoard, deleteBoard, renameBoard, updateBoardColumns } = useKanbanStorage()
  // For admin panel
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  // Standard users only ever see the boards assigned to them
  const boards =
    session.role === "user"
      ? allBoards.filter((b) => (session.assignedBoardIds || []).includes(b.id))
      : allBoards

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

  if (showAdminPanel && session.role === "admin") {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />
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
        session={session}
      />
    )
  }

  return (
    <div>
      {session.role === "admin" && (
        <div className="bg-muted p-2 flex justify-end px-8">
          <button onClick={() => setShowAdminPanel(true)} className="text-sm font-medium hover:underline text-primary">
            Ir al Panel de Administración
          </button>
        </div>
      )}
      <BoardsDashboard
        boards={boards}
        onSelectBoard={setSelectedBoardId}
        onAddBoard={addBoard}
        onDeleteBoard={deleteBoard}
        onRenameBoard={renameBoard}
        onLogout={onLogout}
        canManage={session.role === "admin"}
      />
    </div>
  )
}

export function AppShell() {
  const [authState, setAuthState] = useState<
    "loading" | "login" | "authenticated"
  >("loading")
  const [session, setSession] = useState<any>(null)

  const checkSession = useCallback(() => {
    const sessionInfo = getSessionFromCookie()
    if (sessionInfo.isValid) {
      setSession(sessionInfo)
      setAuthState("authenticated")
    } else {
      setSession(null)
      setAuthState("login")
    }
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
    setSession(null)
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
    return <LoginForm onLogin={() => {
      checkSession()
    }} />
  }

  return <MainApp onLogout={handleLogout} session={session} />
}
