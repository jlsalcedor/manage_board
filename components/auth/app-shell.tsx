"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { LoginForm } from "./login-form"
import { useKanbanStorage } from "@/hooks/use-kanban-storage"
import { BoardsDashboard } from "@/components/kanban/boards-dashboard"
import { API_URL } from "@/lib/utils"
import { AdminPanel } from "@/components/admin/admin-panel"
import { ChangePasswordDialog } from "./change-password-dialog"

const KanbanBoard = dynamic(
  () =>
    import("@/components/kanban/kanban-board").then((mod) => mod.KanbanBoard),
  { ssr: false }
)

// The session cookie is httpOnly and signed, so only the server can read and verify it
async function fetchSession() {
  try {
    const res = await fetch(`${API_URL}/api/auth/session`, { credentials: "include" })
    if (!res.ok) return null
    const data = await res.json()
    return data.authenticated ? data : null
  } catch {
    return null
  }
}

function MainApp({ onLogout, session }: { onLogout: () => void, session: any }) {
  const { boards: allBoards, isLoading, addBoard, deleteBoard, renameBoard, updateBoardColumns } = useKanbanStorage()
  // For admin panel
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Only standard users manage their own password; the admin's lives in .env
  const onChangePassword = session.role === "user" ? () => setShowChangePassword(true) : undefined
  const changePasswordDialog = (
    <ChangePasswordDialog
      open={showChangePassword}
      onOpenChange={setShowChangePassword}
      onSuccess={() => setShowChangePassword(false)}
    />
  )

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
      <>
        <KanbanBoard
          board={selectedBoard}
          updateColumns={(updater) => updateBoardColumns(selectedBoardId, updater)}
          onBack={() => setSelectedBoardId(null)}
          onLogout={onLogout}
          onChangePassword={onChangePassword}
          session={session}
        />
        {changePasswordDialog}
      </>
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
        onChangePassword={onChangePassword}
        canManage={session.role === "admin"}
      />
      {changePasswordDialog}
    </div>
  )
}

export function AppShell() {
  const [authState, setAuthState] = useState<
    "loading" | "login" | "authenticated"
  >("loading")
  const [session, setSession] = useState<any>(null)

  const checkSession = useCallback(async () => {
    const sessionInfo = await fetchSession()
    if (sessionInfo) {
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

  const handleLogout = useCallback(async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
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

  // Mandatory password change (first login or admin reset): block the app until done
  if (session.mustChangePassword) {
    return (
      <div className="min-h-screen bg-background">
        <ChangePasswordDialog
          open
          required
          onSuccess={checkSession}
          onLogout={handleLogout}
        />
      </div>
    )
  }

  return <MainApp onLogout={handleLogout} session={session} />
}
