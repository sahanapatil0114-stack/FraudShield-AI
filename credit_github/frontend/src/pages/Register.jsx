import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong']
  const strengthColor = ['', 'bg-neon-pink', 'bg-yellow-400', 'bg-neon-green']

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-neon-purple/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple mx-auto mb-4 flex items-center justify-center text-3xl shadow-neon-blue">🛡️</div>
          <h1 className="font-cyber text-2xl font-bold gradient-text">JOIN FRAUDSHIELD</h1>
          <p className="text-white/40 text-sm mt-1">Create your secure account</p>
        </div>

        <div className="glass border border-neon-blue/15 rounded-2xl p-8 shadow-neon-blue">
          <h2 className="font-cyber text-lg font-bold text-white mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Anderson" className="input-cyber" required />
            </div>
            <div>
              <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-cyber" required />
            </div>
            <div>
              <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Phone (optional)</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1-555-0100" className="input-cyber" />
            </div>
            <div>
              <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="input-cyber" required />
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength === 3 ? 'text-neon-green' : strength === 2 ? 'text-yellow-400' : 'text-neon-pink'}`}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-cyber" required />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-neon-pink text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading || form.password !== form.confirmPassword} className="btn-neon w-full py-3.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> CREATING ACCOUNT...</> : '✨ CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-blue hover:text-neon-blue/80 font-semibold">Sign in →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
