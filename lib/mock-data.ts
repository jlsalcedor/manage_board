import type { BoardState } from "./kanban-types"

export const initialBoard: BoardState = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-tag-purple",
    stories: [
      {
        id: "story-1",
        title: "Implementar autenticacion OAuth",
        description:
          "Como usuario quiero poder iniciar sesion con Google y GitHub para acceder rapidamente.",
        priority: "high",
        tags: ["backend", "feature"],
        assignee: "Carlos M.",
        points: 8,
        createdAt: "2026-02-25",
      },
      {
        id: "story-2",
        title: "Disenar pagina de onboarding",
        description:
          "Como nuevo usuario quiero un flujo de onboarding claro para entender las funcionalidades.",
        priority: "medium",
        tags: ["design", "frontend"],
        assignee: "Ana R.",
        points: 5,
        createdAt: "2026-02-26",
      },
      {
        id: "story-3",
        title: "Corregir bug en el carrito",
        description:
          "Los productos duplicados no se agrupan correctamente al agregar desde la vista rapida.",
        priority: "critical",
        tags: ["bug", "frontend"],
        assignee: "Luis P.",
        points: 3,
        createdAt: "2026-02-27",
      },
    ],
  },
  {
    id: "todo",
    title: "Por Hacer",
    color: "bg-tag-blue",
    stories: [
      {
        id: "story-4",
        title: "API de notificaciones push",
        description:
          "Como usuario quiero recibir notificaciones push cuando haya actividad relevante en mi cuenta.",
        priority: "high",
        tags: ["backend", "feature"],
        assignee: "Diego S.",
        points: 13,
        createdAt: "2026-02-20",
      },
      {
        id: "story-5",
        title: "Componente de calendario",
        description:
          "Como usuario quiero ver mis eventos en un calendario interactivo con vista mensual y semanal.",
        priority: "medium",
        tags: ["frontend", "feature"],
        assignee: "Maria L.",
        points: 8,
        createdAt: "2026-02-22",
      },
    ],
  },
  {
    id: "in-progress",
    title: "En Progreso",
    color: "bg-tag-orange",
    stories: [
      {
        id: "story-6",
        title: "Dashboard de metricas",
        description:
          "Como administrador quiero ver metricas clave en un dashboard con graficos interactivos.",
        priority: "high",
        tags: ["frontend", "feature"],
        assignee: "Sofia G.",
        points: 13,
        createdAt: "2026-02-15",
      },
      {
        id: "story-7",
        title: "Migracion a PostgreSQL",
        description:
          "Migrar la base de datos de MySQL a PostgreSQL para mejorar el rendimiento.",
        priority: "critical",
        tags: ["backend"],
        assignee: "Carlos M.",
        points: 21,
        createdAt: "2026-02-10",
      },
    ],
  },
  {
    id: "review",
    title: "En Revision",
    color: "bg-tag-green",
    stories: [
      {
        id: "story-8",
        title: "Tests e2e del checkout",
        description:
          "Agregar tests end-to-end para todo el flujo de compra incluyendo pagos.",
        priority: "medium",
        tags: ["backend", "feature"],
        assignee: "Luis P.",
        points: 5,
        createdAt: "2026-02-18",
      },
    ],
  },
  {
    id: "done",
    title: "Terminado",
    color: "bg-tag-green",
    stories: [
      {
        id: "story-9",
        title: "Configurar CI/CD pipeline",
        description:
          "Configurar pipeline de integracion continua con GitHub Actions y deploy automatico.",
        priority: "high",
        tags: ["backend"],
        assignee: "Diego S.",
        points: 8,
        createdAt: "2026-02-05",
      },
      {
        id: "story-10",
        title: "Redisenar perfil de usuario",
        description:
          "Como usuario quiero un perfil mas moderno con opciones de personalizacion.",
        priority: "low",
        tags: ["design", "frontend"],
        assignee: "Ana R.",
        points: 5,
        createdAt: "2026-02-01",
      },
    ],
  },
]
