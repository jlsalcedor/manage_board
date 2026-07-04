"use client"

import { useState, useEffect, useCallback } from "react"
import { API_URL } from "@/lib/utils"

export interface User {
  id: string
  username: string
  password?: string // only for admin UI
  role: string
  assignedBoardIds: string[]
  createdAt: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error("Error fetching users", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const createUser = async (user: Partial<User>) => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => [...prev, data.user])
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      console.error(err)
      return { success: false, error: "Error en red" }
    }
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === id ? data.user : u))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      console.error(err)
      return { success: false, error: "Error en red" }
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE"
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== id))
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (err) {
      console.error(err)
      return { success: false, error: "Error en red" }
    }
  }

  return { users, isLoading, createUser, updateUser, deleteUser, refreshUsers: fetchUsers }
}
