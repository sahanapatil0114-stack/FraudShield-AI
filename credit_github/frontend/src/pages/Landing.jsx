import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Detection', desc: 'Real-time machine learning model analyzes every transaction against 50+ fraud indicators.' },
  { icon: '⚡', title: 'Instant Analysis', desc: 'Get fraud probability scores and risk assessments in milliseconds.' },
  { icon: '📊', title: 'Advanced Analytics', desc: 'Interactive charts and reports give you complete visibility into transaction patterns.' },
  { icon: '🔔', title: 'Smart Alerts', desc: 'Instant notifications for high-risk transactions with detailed risk breakdowns.' },
  { icon: '🎙️', title: 'Voice Assistant', desc: 'AI-powered voice assistant guides you through the platform and answers fraud questions.' },
  { icon: '🔐', title: 'Bank-Grade Security', desc: 'Role-based access control, encrypted sessions, and audit logs for compliance.' },
]

const STATS = [
  { val: '98.4%', label: 'Detection Accuracy' },
  { val: '< 200ms', label: 'Analysis Speed' },
  { val: '10M+', label: 'Transactions Analyzed' },
  { val: '$2.1B', label: 'Fraud Prevented' },
]

function CountUp({ end, duration = 2000 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isNumber = !isNaN(parseFloat(end))
    if (!isNumber) { el.textContent = end; return }
    const target = parseFloat(end)
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = (target * eased).toFixed(0)
      if (progress < 1) requestAnimationFrame(animate)
      else el.textContent = end
    }
    requestAnimationFrame(animate)
  }, [end, duration])
  return <span ref={ref}>{end}</span>
}

// Animated ticker
const TICKER_ITEMS = [
  '🔴 FRAUD ALERT · TXN#8821 · $4,291 · Unknown Vendor · Lagos',
  '🟢 SAFE · TXN#8822 · $42.99 · Starbucks · New York',
  '🔴 FRAUD ALERT · TXN#8823 · $7,100 · Phantom Store · Moscow',
  '🟢 SAFE · TXN#8824 · $199.99 · Amazon · Chicago',
  '🟡 REVIEW · TXN#8825 · $890 · Crypto Exchange · Unknown',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-900 bg-grid relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-neon-blue/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl" />
      </div>

      {/* ── Ticker ─────────────────────────────────────────── */}
      <div className="bg-neon-blue/5 border-b border-neon-blue/10 py-2 overflow-hidden relative">
        <div className="flex gap-8 animate-[ticker_20s_linear_infinite]" style={{ animation: 'none' }}>
          <div className="flex gap-8 whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="text-xs text-white/40 font-cyber shrink-0">{item}</span>
            ))}
          </div>
        </div>
        {/* Marquee using CSS */}
        <style>{`
          @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .ticker-inner { display: flex; animation: ticker 30s linear infinite; }
        `}</style>
        <div className="ticker-inner gap-12 whitespace-nowrap text-xs">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className={`shrink-0 font-cyber ${item.includes('FRAUD') ? 'text-neon-pink/70' : item.includes('SAFE') ? 'text-neon-green/70' : 'text-yellow-400/70'}`}>
              {item} &nbsp;&nbsp;|&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-xs font-cyber text-neon-blue tracking-widest">AI FRAUD DETECTION ONLINE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-cyber font-black mb-6 leading-none">
            <span className="gradient-text">FRAUDSHIELD</span>
            <br />
            <span className="text-white/90">AI GUARDIAN</span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Next-generation credit card fraud detection powered by machine learning.
            Protect every transaction with real-time AI analysis, smart alerts, and beautiful analytics.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn-neon py-3.5 px-8 text-sm flex items-center gap-2">
                🚀 GET STARTED FREE
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn-outline py-3.5 px-8 text-sm">
                SIGN IN →
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard preview card */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="glass border border-neon-blue/15 rounded-2xl p-6 max-w-3xl mx-auto shadow-neon-blue relative overflow-hidden animate-float">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/3 to-neon-purple/3" />
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Analyzed Today', val: '2,847', color: 'text-neon-blue' },
              { label: 'Fraud Caught', val: '143', color: 'text-neon-pink' },
              { label: 'Safe Transactions', val: '2,704', color: 'text-neon-green' },
              { label: 'Accuracy Rate', val: '98.4%', color: 'text-neon-purple' },
            ].map(s => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold font-cyber ${s.color}`}>{s.val}</p>
                <p className="text-white/30 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Mini chart preview */}
          <div className="bg-white/3 rounded-xl p-4 flex items-end gap-1.5 h-24">
            {[40, 65, 30, 80, 55, 90, 45, 70, 35, 85, 60, 95, 50, 75, 42, 88, 62, 78, 45, 92].map((h, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-neon-pink/60' : 'bg-neon-blue/40'}`} />
            ))}
          </div>
          <p className="text-center text-xs text-white/20 mt-2 font-cyber">REAL-TIME TRANSACTION ANALYSIS STREAM</p>
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-4xl font-black font-cyber gradient-text mb-2">{s.val}</p>
              <p className="text-white/40 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="relative z-10 py-20 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="font-cyber text-neon-blue text-xs tracking-widest mb-3">CAPABILITIES</p>
          <h2 className="text-4xl font-cyber font-black text-white">Why FraudShield AI?</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass glass-hover border border-white/5 rounded-xl p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-cyber text-sm text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="glass border border-neon-blue/20 rounded-2xl p-12 max-w-3xl mx-auto shadow-neon-blue">
          <h2 className="text-3xl font-cyber font-black gradient-text mb-4">Start Protecting Your Transactions Today</h2>
          <p className="text-white/40 mb-8">Join thousands of users who trust FraudShield AI to secure their financial data.</p>
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-neon py-4 px-10 text-sm">
              🛡️ CREATE FREE ACCOUNT
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="font-cyber text-xs text-white/20 tracking-widest">
          © 2024 FRAUDSHIELD AI · PROTECTING EVERY TRANSACTION
        </p>
      </footer>
    </div>
  )
}
