const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export function getApiBase() {
  return API
}

export type AuthUser = {
  id: string
  name?: string
  phone?: string
  role: 'farmer' | 'marketer' | 'admin' | string
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('agri-cart')
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {})
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API}${path}`, { ...options, headers })
  return res
}

export async function apiJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return data as T
}
