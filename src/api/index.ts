export async function apiFetch<T>(
  endpoint: string,
  token?: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`API Error (${res.status}): ${errorText}`)
  }

  return res.json()
}

export * from './endpoints/auth'
export * from './endpoints/products'
export * from './endpoints/periods'
export * from './endpoints/records'

export * from './types'
