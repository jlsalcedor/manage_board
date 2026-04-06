"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { BoardState } from "@/lib/kanban-types"

const EMPTY_BOARD: BoardState = []

async function fetchBoard(): Promise<BoardState> {
  try {
    const res = await fetch("/api/board")
    console.log("[v0] fetchBoard response status:", res.status)
    if (!res.ok) return EMPTY_BOARD
    const data = await res.json()
    console.log("[v0] fetchBoard data:", JSON.stringify(data).slice(0, 200))
    return Array.isArray(data) ? data : EMPTY_BOARD
  } catch (err) {
    console.log("[v0] fetchBoard error:", err)
    return EMPTY_BOARD
  }
}

async function persistBoard(board: BoardState) {
  try {
    console.log("[v0] persistBoard called, columns:", board.length, "stories:", board.reduce((s, c) => s + c.stories.length, 0))
    const res = await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(board),
    })
    const result = await res.json()
    console.log("[v0] persistBoard result:", result)
  } catch (err) {
    console.log("[v0] persistBoard error:", err)
  }
}

export function useKanbanStorage() {
  const [board, setBoardState] = useState<BoardState>(EMPTY_BOARD)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  // Load from JSON file on mount
  useEffect(() => {
    fetchBoard().then((data) => {
      setBoardState(data)
      setIsLoading(false)
      initialized.current = true
    })
  }, [])

  // Persist to JSON file whenever board changes (skip initial load)
  useEffect(() => {
    if (!initialized.current) return
    persistBoard(board)
  }, [board])

  const setBoard = useCallback(
    (updater: BoardState | ((prev: BoardState) => BoardState)) => {
      setBoardState(updater)
    },
    []
  )

  const resetBoard = useCallback(() => {
    setBoardState(EMPTY_BOARD)
    persistBoard(EMPTY_BOARD)
  }, [])

  return { board, setBoard, resetBoard, isLoading }
}
