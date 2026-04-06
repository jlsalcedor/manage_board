export type Priority = "low" | "medium" | "high" | "critical"
export type Tag = "frontend" | "backend" | "design" | "bug" | "feature"

export interface UserStory {
  id: string
  title: string
  description: string
  priority: Priority
  tags: Tag[]
  assignee: string
  points: number
  createdAt: string
}

export interface KanbanColumn {
  id: string
  title: string
  color: string
  stories: UserStory[]
}

export type BoardState = KanbanColumn[]
