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

  const responseText = await res.text()

  if (res.status === 422) {
    try {
      const errorData = JSON.parse(responseText)
      if (errorData.found?.data !== undefined) {
        return errorData.found as T
      }
    } catch {
      // ignore
    }
  }

  if (res.status === 204) {
    return {} as T
  }

  if (!res.ok) {
    throw new Error(`API Error (${res.status}): ${responseText}`)
  }

  try {
    return JSON.parse(responseText) as T
  } catch (err) {
    throw new Error(`Failed to parse API response: ${responseText}`)
  }
}


export * from './endpoints/auth'
export * from './endpoints/products'
export * from './endpoints/periods'
export * from './endpoints/records'
export * from './endpoints/categories'

export * from './types'
