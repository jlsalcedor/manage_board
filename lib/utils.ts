import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Stored image paths look like "/uploads/<file>"; they are served by /api/uploads/[file].
export function resolveImageUrl(src: string) {
  if (src.startsWith("/uploads/")) {
    return `${API_URL}/api/uploads/${src.slice("/uploads/".length)}`
  }
  return src
}
