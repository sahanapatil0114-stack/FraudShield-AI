import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@fraudshield.ai', password: 'password' })
    else setForm({ email: 'john@example.com', password: 'password' })
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center px-4 relative overflow-hidden">
      {/* BG glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-blue/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-neon-purple/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple mx-auto mb-4 flex items-center justify-center text-3xl shadow-neon-blue">
            🛡️
          </div>
          <h1 className="font-cyber text-2xl font-bold gradient-text">FRAUDSHIELD AI</h1>
          <p className="text-white/40 text-sm mt-1">Secure authentication portal</p>
        </div>

        {/* Card */}
        <div className="glass border border-neon-blue/15 rounded-2xl p-8 shadow-neon-blue">
          <h2 className="font-cyber text-lg font-bold text-white mb-6">Sign In</h2>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button onClick={() => fillDemo('admin')}
              className="py-2 px-3 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-cyber hover:bg-neon-purple/20 transition-all">
              👑 Admin Demo
            </button>
            <button onClick={() => fillDemo('user')}
              className="py-2 px-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-cyber hover:bg-neon-blue/20 transition-all">
              👤 User Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@fraudshield.ai" className="input-cyber" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" className="input-cyber" required autoComplete="current-password" />
            </div>

            <button type="submit" disabled={loading} className="btn-neon w-full py-3.5 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> AUTHENTICATING...</>
              ) : '🔐 SIGN IN'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-neon-blue hover:text-neon-blue/80 font-semibold">Create one →</Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/15 mt-6 font-cyber">
          DEFAULT PASSWORD: password
        </p>
      </motion.div>
    </div>
  )
}
