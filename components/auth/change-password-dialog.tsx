"use client"

import { useState } from "react"
import { Eye, EyeOff, KeyRound, Loader2, LogOut } from "lucide-react"
import { API_URL } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

// Keep in sync with MIN_PASSWORD_LENGTH in lib/password.ts (server-only module)
const MIN_PASSWORD_LENGTH = 8

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  // Mandatory mode: cannot be dismissed, only completed or abandoned via logout
  required?: boolean
  onSuccess: () => void
  onLogout?: () => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  required = false,
  onSuccess,
  onLogout,
}: ChangePasswordDialogProps) {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowPasswords(false)
    setError("")
  }

  const handleOpenChange = (next: boolean) => {
    if (required) return
    if (!next) resetForm()
    onOpenChange?.(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (newPassword === currentPassword) {
      setError("La nueva contraseña debe ser distinta a la actual")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al cambiar la contraseña")
        return
      }

      toast({ title: "Éxito", description: "Contraseña actualizada correctamente" })
      resetForm()
      onSuccess()
    } catch {
      setError("Error de conexion con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const inputType = showPasswords ? "text" : "password"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!required}
        onEscapeKeyDown={(e) => required && e.preventDefault()}
        onInteractOutside={(e) => required && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Cambiar contraseña
          </DialogTitle>
          <DialogDescription>
            {required
              ? "Por seguridad debes cambiar tu contraseña antes de continuar."
              : "Ingresa tu contraseña actual y la nueva contraseña."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña actual</Label>
            <Input
              id="current-password"
              type={inputType}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={inputType}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                className="pr-10"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              >
                {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
            <Input
              id="confirm-password"
              type={inputType}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            {required && onLogout && (
              <Button type="button" variant="outline" onClick={onLogout} className="gap-1.5">
                <LogOut className="size-3.5" />
                Salir
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="flex-1 gap-2"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
