"use client"

import { useLogs } from "@/hooks/use-logs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function LogsViewer() {
  const { logs, isLoading } = useLogs()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Bitácora de Acciones</h2>
      
      {isLoading ? (
        <p>Cargando bitácora...</p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha / Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.userId}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">No hay registros en la bitácora</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
