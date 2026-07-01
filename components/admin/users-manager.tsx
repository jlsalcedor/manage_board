"use client"

import { useState } from "react"
import { useUsers, User } from "@/hooks/use-users"
import { useKanbanStorage } from "@/hooks/use-kanban-storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    assignedBoardId: ""
  })

  const resetForm = () => {
    setFormData({ username: "", password: "", assignedBoardId: "" })
    setEditingId(null)
  }

  const handleOpen = (user?: User) => {
    if (user) {
      setFormData({
        username: user.username,
        password: user.password || "",
        assignedBoardId: user.assignedBoardId || ""
      })
      setEditingId(user.id)
    } else {
      resetForm()
    }
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || !formData.password || !formData.assignedBoardId) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" })
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
                <Label>Tablero Asignado</Label>
                <Select 
                  value={formData.assignedBoardId} 
                  onValueChange={val => setFormData({...formData, assignedBoardId: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tablero" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map(board => (
                      <SelectItem key={board.id} value={board.id}>{board.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <TableHead>Tablero</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const assignedBoard = boards.find(b => b.id === user.assignedBoardId)
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell>{assignedBoard?.title || "Desconocido"}</TableCell>
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
