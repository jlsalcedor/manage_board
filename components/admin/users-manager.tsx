"use client"

import { useState } from "react"
import { useUsers, User } from "@/hooks/use-users"
import { useKanbanStorage } from "@/hooks/use-kanban-storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Trash2, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function UsersManager() {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers()
  const { boards } = useKanbanStorage()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    assignedBoardIds: [] as string[]
  })

  const resetForm = () => {
    setFormData({ username: "", password: "", assignedBoardIds: [] })
    setEditingId(null)
  }

  const handleOpen = (user?: User) => {
    if (user) {
      setFormData({
        username: user.username,
        password: user.password || "",
        assignedBoardIds: user.assignedBoardIds || []
      })
      setEditingId(user.id)
    } else {
      resetForm()
    }
    setIsOpen(true)
  }

  const toggleBoard = (boardId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedBoardIds: checked
        ? [...prev.assignedBoardIds, boardId]
        : prev.assignedBoardIds.filter((id) => id !== boardId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || !formData.password) {
      toast({ title: "Error", description: "Usuario y contraseña son obligatorios", variant: "destructive" })
      return
    }

    const res = editingId 
      ? await updateUser(editingId, formData)
      : await createUser(formData)

    if (res.success) {
      toast({ title: "Éxito", description: `Usuario ${editingId ? 'actualizado' : 'creado'} correctamente` })
      setIsOpen(false)
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      const res = await deleteUser(id)
      if (res.success) {
        toast({ title: "Éxito", description: "Usuario eliminado" })
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()}>Crear Usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input 
                  id="username" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="text" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Tableros Asignados</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {boards.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay tableros creados</p>
                  )}
                  {boards.map(board => (
                    <div key={board.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`board-${board.id}`}
                        checked={formData.assignedBoardIds.includes(board.id)}
                        onCheckedChange={(checked) => toggleBoard(board.id, checked === true)}
                      />
                      <Label htmlFor={`board-${board.id}`} className="font-normal cursor-pointer">
                        {board.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Guardar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Contraseña</TableHead>
                <TableHead>Tableros</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const assignedTitles = (user.assignedBoardIds || [])
                  .map(id => boards.find(b => b.id === id)?.title)
                  .filter(Boolean)
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell>{assignedTitles.length > 0 ? assignedTitles.join(", ") : "Ninguno"}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpen(user)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No hay usuarios creados</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
