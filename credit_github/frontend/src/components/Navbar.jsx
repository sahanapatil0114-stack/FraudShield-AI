import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { notifAPI } from '../api/backend'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs]       = useState([])
  const [unread, setUnread]       = useState(0)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    if (!user) return
    notifAPI.list()
      .then(res => {
        setNotifs(res.data.data?.notifications || [])
        setUnread(res.data.data?.unread_count || 0)
      })
      .catch(() => {})
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const markRead = async () => {
    await notifAPI.markRead().catch(() => {})
    setUnread(0)
    setNotifs(n => n.map(x => ({ ...x, is_read: 1 })))
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm shadow-neon-blue">
            🛡️
          </div>
          <span className="font-cyber text-sm font-bold gradient-text hidden sm:block">FRAUDSHIELD AI</span>
        </Link>

        {/* Center nav */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {[
              { path: user.role === 'admin' ? '/admin' : '/dashboard', label: 'Dashboard' },
            ].map(({ path, label }) => (
              <Link key={path} to={path}
                className={`nav-link px-4 py-2 text-sm ${isActive(path) ? 'active' : ''}`}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => { setNotifOpen(o => !o); if (!notifOpen && unread > 0) markRead() }}
                  className="relative w-9 h-9 rounded-lg glass border border-white/8 flex items-center justify-center text-white/50 hover:text-neon-blue hover:border-neon-blue/30 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink rounded-full text-white text-xs flex items-center justify-center font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-12 w-80 glass border border-white/8 rounded-xl overflow-hidden shadow-glass z-50">
                      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <p className="font-cyber text-xs text-neon-blue tracking-wider">NOTIFICATIONS</p>
                        <button onClick={markRead} className="text-xs text-white/30 hover:text-white/60">Mark all read</button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifs.length === 0 ? (
                          <p className="text-center py-8 text-white/30 text-sm">No notifications</p>
                        ) : notifs.slice(0, 8).map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-white/3 hover:bg-white/3 transition-colors ${!n.is_read ? 'bg-neon-blue/3' : ''}`}>
                            <div className="flex items-start gap-2">
                              {!n.is_read && <div className="notif-dot mt-1.5 shrink-0" />}
                              <div>
                                <p className="text-sm text-white/80 font-medium">{n.title}</p>
                                <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-xs text-white/20 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative">
                <button onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2.5 glass border border-white/8 rounded-lg px-3 py-1.5 hover:border-neon-blue/30 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white/80 leading-none">{user.name}</p>
                    <p className={`text-xs mt-0.5 font-cyber ${user.role === 'admin' ? 'text-neon-purple' : 'text-neon-blue'}`}>{user.role}</p>
                  </div>
                  <svg className="w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-12 w-44 glass border border-white/8 rounded-xl overflow-hidden shadow-glass z-50">
                      <div className="p-1">
                        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMenuOpen(false)}
                          className="nav-link text-sm py-2">📊 Dashboard</Link>
                        <button onClick={handleLogout} className="nav-link text-sm py-2 text-neon-pink/80 hover:text-neon-pink w-full">
                          🚪 Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-outline py-1.5 px-4 text-sm">Login</Link>
              <Link to="/register" className="btn-neon py-1.5 px-4 text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
