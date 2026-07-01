"use client"

import { useState, useEffect, useCallback } from "react"
import { API_URL } from "@/lib/utils"

export interface AuditLog {
  id: string
  userId: string
  action: string
  details: string
  timestamp: string
}

export function useLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/logs`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (err) {
      console.error("Error fetching logs", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const createLog = async (log: Omit<AuditLog, "id" | "timestamp">) => {
    try {
      const res = await fetch(`${API_URL}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log)
      })
      // No need to update local state immediately if we are just logging
      // If we are on the admin panel, it will be refreshed when opened
    } catch (err) {
      console.error("Error creating log", err)
    }
  }

  return { logs, isLoading, fetchLogs, createLog }
}
