// src/utils/formatDate.ts

/**
 * @param dateString 
 * @param fallback  
 * @returns 
 */
export function formatDate(dateString?: string | null, fallback: string = 'N/A'): string {
  if (!dateString) return fallback
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return fallback
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * @param dateString
 * @param fallback 
 * @returns 
 */
export function formatDateTime(dateString?: string | null, fallback: string = 'N/A'): string {
  if (!dateString) return fallback
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return fallback
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}