"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersManager } from "./users-manager"
import { LogsViewer } from "./logs-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="logs">Bitácora</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-0">
            <UsersManager />
          </TabsContent>
          <TabsContent value="logs" className="mt-0">
            <LogsViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
