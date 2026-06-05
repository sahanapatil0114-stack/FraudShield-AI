import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { authAPI } from '../api/backend'

const AuthContext = createContext(null)

// ── Demo users (no backend needed) ────────────────────────
const DEMO_USERS = {
  'admin@fraudshield.ai': { id: 1, name: 'Super Admin',    email: 'admin@fraudshield.ai', role: 'admin', phone: '+1-555-0100' },
  'john@example.com':     { id: 2, name: 'John Anderson',  email: 'john@example.com',     role: 'user',  phone: '+1-555-0101' },
  'sarah@example.com':    { id: 3, name: 'Sarah Mitchell', email: 'sarah@example.com',    role: 'user',  phone: '+1-555-0102' },
  'mike@example.com':     { id: 4, name: 'Mike Thompson',  email: 'mike@example.com',     role: 'user',  phone: '+1-555-0103' },
}
const DEMO_PASS = 'password'
const SESSION_KEY = 'fraudshield_user'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session once — no double-set flicker from localStorage then /me
  useEffect(() => {
    authAPI.me()
      .then(res => {
        const u = res.data.data
        setUser(u)
        localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem(SESSION_KEY)
          setUser(null)
        } else if (!err.response) {
          const stored = localStorage.getItem(SESSION_KEY)
          if (stored) {
            try { setUser(JSON.parse(stored)) } catch {}
          }
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      // Try real backend first
      const res = await authAPI.login({ email, password })
      const u = res.data.data
      setUser(u)
      localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      return u
    } catch (err) {
      // Fallback: demo mode when backend is offline
      const demo = DEMO_USERS[email.toLowerCase()]
      if (demo && password === DEMO_PASS) {
        setUser(demo)
        localStorage.setItem(SESSION_KEY, JSON.stringify(demo))
        return demo
      }
      // Surface original error if backend returned one
      if (err.response?.status === 401) throw err
      // Backend offline & wrong credentials
      throw new Error('Invalid email or password (Demo: use "password")')
    }
  }, [])

  const register = useCallback(async (name, email, password, phone) => {
    try {
      const res = await authAPI.register({ name, email, password, phone })
      return res.data
    } catch (err) {
      // Demo mode: if backend offline just confirm registration
      if (!err.response) {
        return { success: true, message: 'Demo: Registration accepted. Use "password" to log in.' }
      }
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    await authAPI.logout().catch(() => {})
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, register, setUser }),
    [user, loading, login, logout, register]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
