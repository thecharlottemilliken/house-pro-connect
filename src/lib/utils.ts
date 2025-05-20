
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add normalizeAreaName utility function for consistent key formatting
export function normalizeAreaName(area: string): string {
  if (!area) return '';
  // Convert to lowercase and replace any whitespace with underscores
  return area.toLowerCase().replace(/\s+/g, '_');
}
