export async function apiFetch<T>(
  endpoint: string,
  token?: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL
  if (!baseUrl) throw new Error('VITE_API_URL is not defined')

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const text = await res.text()

  // 204 No Content
  if (res.status === 204 || !text) {
    return null as unknown as T
  }

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Failed to parse API response: ${text}`)
  }

  if (res.status === 422 && data.found) {
    return data.found as T
  }

  if (!res.ok) {
    throw new Error(`API Error (${res.status}): ${JSON.stringify(data)}`)
  }

  return data as T
}

export * from './endpoints/auth'
export * from './endpoints/products'
export * from './endpoints/periods'
export * from './endpoints/records'
export * from './endpoints/categories'
export * from './types'
