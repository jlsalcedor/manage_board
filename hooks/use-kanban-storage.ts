"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { AppState, KanbanBoardData, KanbanColumn } from "@/lib/kanban-types"
import { API_URL } from "@/lib/utils"

const EMPTY_APP_STATE: AppState = []

async function fetchAppState(): Promise<AppState> {
  try {
    const res = await fetch(`${API_URL}/api/board`)
    console.log("[v0] fetchAppState response status:", res.status)
    if (!res.ok) return EMPTY_APP_STATE
    const data = await res.json()
    console.log("[v0] fetchAppState data length:", Array.isArray(data) ? data.length : 0)
    // Check if it's an old BoardState (columns directly) or AppState (boards)
    // We assume it's correctly migrated or starting empty as agreed.
    return Array.isArray(data) ? data : EMPTY_APP_STATE
  } catch (err) {
    console.log("[v0] fetchAppState error:", err)
    return EMPTY_APP_STATE
  }
}

async function persistAppState(appState: AppState) {
  try {
    const res = await fetch(`${API_URL}/api/board`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appState),
    })
    const result = await res.json()
    console.log("[v0] persistAppState result:", result)
  } catch (err) {
    console.log("[v0] persistAppState error:", err)
  }
}

export function useKanbanStorage() {
  const [boards, setBoardsState] = useState<AppState>(EMPTY_APP_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  // Load from JSON file on mount
  useEffect(() => {
    fetchAppState().then((data) => {
      setBoardsState(data)
      setIsLoading(false)
      initialized.current = true
    })
  }, [])

  // Persist to JSON file whenever boards state changes (skip initial load)
  useEffect(() => {
    if (!initialized.current) return
    persistAppState(boards)
  }, [boards])

  const addBoard = useCallback((title: string) => {
    const newBoard: KanbanBoardData = {
      id: `board-${Date.now()}`,
      title,
      columns: [],
      createdAt: new Date().toISOString(),
    }
    setBoardsState((prev) => [...prev, newBoard])
  }, [])

  const deleteBoard = useCallback((id: string) => {
    setBoardsState((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const renameBoard = useCallback((id: string, newTitle: string) => {
    setBoardsState((prev) =>
      prev.map((b) => (b.id === id ? { ...b, title: newTitle } : b))
    )
  }, [])

  const updateBoardColumns = useCallback(
    (boardId: string, updater: KanbanColumn[] | ((prev: KanbanColumn[]) => KanbanColumn[])) => {
      setBoardsState((prev) =>
        prev.map((b) => {
          if (b.id === boardId) {
            const newColumns = typeof updater === "function" ? updater(b.columns) : updater
            return { ...b, columns: newColumns }
          }
          return b
        })
      )
    },
    []
  )

  const resetAll = useCallback(() => {
    setBoardsState(EMPTY_APP_STATE)
    persistAppState(EMPTY_APP_STATE)
  }, [])

  return { 
    boards, 
    isLoading, 
    addBoard, 
    deleteBoard, 
    renameBoard, 
    updateBoardColumns, 
    resetAll 
  }
}
