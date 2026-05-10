const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  is_active: boolean
  oauth_provider: "google" | "github" | null
  avatar: string | null
  created_at: string
  updated_at: string
  last_login: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// Token management
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token)
}

export function removeToken() {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_user")
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("auth_user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem("auth_user", JSON.stringify(user))
}

// API calls
async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: "Erro de rede" }))
    throw new Error(data.detail || `Erro ${res.status}`)
  }
  return res.json()
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  setToken(data.access_token)
  setStoredUser(data.user)
  return data
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const data = await authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  })
  setToken(data.access_token)
  setStoredUser(data.user)
  return data
}

export async function getMe(): Promise<User> {
  const data = await authFetch("/auth/me")
  setStoredUser(data)
  return data
}

export async function updateProfile(updates: { name?: string; email?: string }): Promise<User> {
  const data = await authFetch("/auth/me", {
    method: "PUT",
    body: JSON.stringify(updates),
  })
  setStoredUser(data)
  return data
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return authFetch("/auth/me/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}

export async function getDashboardStats() {
  return authFetch("/dashboard/stats")
}

export function logout() {
  removeToken()
  window.location.href = "/login"
}

// Admin API calls
export async function adminGetUsers(): Promise<{ users: User[]; total: number }> {
  return authFetch("/auth/admin/users")
}

export async function adminUpdateUser(userId: string, updates: Partial<User>) {
  return authFetch(`/auth/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

export async function adminDeleteUser(userId: string) {
  return authFetch(`/auth/admin/users/${userId}`, {
    method: "DELETE",
  })
}
