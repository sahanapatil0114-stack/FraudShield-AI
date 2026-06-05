import axios from 'axios'

// Use proxy for PHP backend or direct XAMPP URL
const BASE = '/phpapi'

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Intercept 401 — clear stale session; avoid hard reload loops on /me checks
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      const onLoginPage = window.location.pathname === '/login'
      if (url.includes('/me.php')) {
        localStorage.removeItem('fraudshield_user')
      } else if (!onLoginPage) {
        localStorage.removeItem('fraudshield_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/api/auth/login.php', data),
  register: (data) => api.post('/api/auth/register.php', data),
  logout:   ()     => api.post('/api/auth/logout.php'),
  me:       ()     => api.get('/api/auth/me.php'),
}

// ── Transactions ──────────────────────────────────────────
export const txnAPI = {
  list:   (params) => api.get('/api/transactions/index.php', { params }),
  create: (data)   => api.post('/api/transactions/index.php', data),
  export: (params) => `${BASE}/api/transactions/export.php?${new URLSearchParams(params)}`,
}

// ── Users (admin) ─────────────────────────────────────────
export const usersAPI = {
  list:   (params) => api.get('/api/users/index.php', { params }),
  update: (data)   => api.put('/api/users/index.php', data),
  delete: (id)     => api.delete(`/api/users/index.php?id=${id}`),
}

// ── Analytics ─────────────────────────────────────────────
export const analyticsAPI = {
  get: () => api.get('/api/analytics/index.php'),
}

// ── Notifications ─────────────────────────────────────────
export const notifAPI = {
  list:    () => api.get('/api/notifications/index.php'),
  markRead:() => api.post('/api/notifications/index.php?action=mark_read'),
}

// ── Logs (admin) ──────────────────────────────────────────
export const logsAPI = {
  list: (params) => api.get('/api/logs/index.php', { params }),
}

export default api
