import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { txnAPI, analyticsAPI } from '../api/backend'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import StatsCard from '../components/StatsCard'
import DataTable from '../components/DataTable'
import TransactionForm from '../components/TransactionForm'
import CSVUpload from '../components/CSVUpload'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend)

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
    tooltip: {
      backgroundColor: 'rgba(10,14,26,0.9)',
      borderColor: 'rgba(0,212,255,0.2)',
      borderWidth: 1,
      titleColor: '#00d4ff',
      bodyColor: 'rgba(255,255,255,0.7)',
    }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } },
  }
}

const TABS = ['overview', 'detect', 'upload', 'history', 'profile']

const EMPTY_ANALYTICS = {
  summary: {
    total_transactions: 0,
    fraud_count: 0,
    safe_count: 0,
    pending_count: 0,
    avg_fraud_probability: 0,
  },
  risk_distribution: [],
  daily_trend: [],
}

const n = (v) => Number(v ?? 0)

export default function UserDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics,  setAnalytics]  = useState(null)
  const [txns,       setTxns]       = useState([])
  const [loading,    setLoading]    = useState(true)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [aRes, tRes] = await Promise.allSettled([
        analyticsAPI.get(),
        txnAPI.list({ limit: 100 }),
      ])

      let analyticsData = EMPTY_ANALYTICS
      let txnList = []

      if (aRes.status === 'fulfilled') {
        analyticsData = aRes.value.data.data
      }
      if (tRes.status === 'fulfilled') {
        txnList = tRes.value.data.data?.transactions || []
      }

      setAnalytics(analyticsData)
      setTxns(txnList)
    } catch {
      setAnalytics(EMPTY_ANALYTICS)
      setTxns([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadData() }, [loadData])

  const summary = analytics?.summary || {}
  const dailyTrend = analytics?.daily_trend || []

  // Chart data
  const hasData = n(summary.total_transactions) > 0 || txns.length > 0

  const lineData = {
    labels: dailyTrend.length > 0
      ? dailyTrend.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }))
      : ['No data'],
    datasets: [
      {
        label: 'Safe',
        data: dailyTrend.length > 0 ? dailyTrend.map(d => n(d.safe)) : [0],
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0,255,136,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00ff88',
        pointRadius: 4,
      },
      {
        label: 'Fraud',
        data: dailyTrend.length > 0 ? dailyTrend.map(d => n(d.fraud)) : [0],
        borderColor: '#ff2d78',
        backgroundColor: 'rgba(255,45,120,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ff2d78',
        pointRadius: 4,
      },
    ],
  }

  const doughnutData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [
        n(analytics?.risk_distribution?.find(r => r.risk_level === 'low')?.count),
        n(analytics?.risk_distribution?.find(r => r.risk_level === 'medium')?.count),
        n(analytics?.risk_distribution?.find(r => r.risk_level === 'high')?.count),
      ],
      backgroundColor: ['rgba(0,255,136,0.7)', 'rgba(255,214,10,0.7)', 'rgba(255,45,120,0.7)'],
      borderColor: ['#00ff88', '#ffd60a', '#ff2d78'],
      borderWidth: 1.5,
    }],
  }

  const txnColumns = [
    { key: 'transaction_ref', label: 'Reference', render: v => <span className="font-cyber text-xs text-neon-blue/80">{v}</span> },
    { key: 'amount', label: 'Amount', render: v => <span className="font-semibold text-white">${Number(v).toLocaleString()}</span> },
    { key: 'merchant', label: 'Merchant' },
    { key: 'location', label: 'Location', render: v => <span className="text-white/50">{v}</span> },
    { key: 'status', label: 'Status', render: v => <span className={`badge-${v}`}>{v}</span> },
    { key: 'risk_level', label: 'Risk', render: v => <span className={`badge-${v}`}>{v}</span> },
    { key: 'fraud_probability', label: 'Fraud Prob.', render: v => <span className="text-white/60 text-xs">{(v * 100).toFixed(1)}%</span> },
    { key: 'transaction_time', label: 'Date', render: v => <span className="text-white/40 text-xs">{new Date(v).toLocaleDateString()}</span>, sortable: true },
  ]

  const TabBtn = ({ id, icon, label }) => (
    <button onClick={() => setActiveTab(id)}
      className={`nav-link text-sm whitespace-nowrap ${activeTab === id ? 'active' : ''}`}>
      <span>{icon}</span> <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-navy-900 bg-grid">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-white/30 text-xs font-cyber tracking-widest uppercase">User Dashboard</p>
          <h1 className="font-cyber text-2xl font-bold gradient-text mt-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/30 text-sm mt-1">
            {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 glass border border-white/5 rounded-xl p-1">
          <TabBtn id="overview" icon="📊" label="Overview" />
          <TabBtn id="detect"   icon="🔍" label="Detect" />
          <TabBtn id="upload"   icon="📂" label="Upload CSV" />
          <TabBtn id="history"  icon="📋" label="History" />
          <TabBtn id="profile"  icon="👤" label="Profile" />
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ─────────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="cyber-spinner" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Transactions" value={n(summary.total_transactions)} icon="💳" color="blue" />
                    <StatsCard title="Fraud Detected"    value={n(summary.fraud_count)} icon="🚨" color="pink" />
                    <StatsCard title="Safe Transactions" value={n(summary.safe_count)} icon="✅" color="green" />
                    <StatsCard title="Avg Fraud Risk"    value={`${(n(summary.avg_fraud_probability) * 100).toFixed(0)}%`} icon="📈" color="purple" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass border border-white/5 rounded-xl p-5">
                      <p className="font-cyber text-xs text-neon-blue tracking-widest uppercase mb-4">Transaction Trend (30 Days)</p>
                      <div style={{ height: 220 }}>
                        <Line data={lineData} options={chartDefaults} />
                      </div>
                    </div>
                    <div className="glass border border-white/5 rounded-xl p-5">
                      <p className="font-cyber text-xs text-neon-blue tracking-widest uppercase mb-4">Risk Distribution</p>
                      <div style={{ height: 180 }}>
                        <Doughnut data={doughnutData} options={{ ...chartDefaults, scales: undefined }} />
                      </div>
                    </div>
                  </div>

                  {/* Recent transactions preview */}
                  <div className="glass border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-cyber text-xs text-neon-blue tracking-widest uppercase">Recent Transactions</p>
                      <button onClick={() => setActiveTab('history')} className="text-xs text-neon-blue/60 hover:text-neon-blue">View All →</button>
                    </div>
                    <div className="space-y-2">
                      {!hasData && (
                        <p className="text-white/30 text-sm text-center py-6">No transactions yet. Use Detect or Upload CSV to get started.</p>
                      )}
                      {txns.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${t.status === 'fraud' ? 'bg-neon-pink/10 border border-neon-pink/20' : 'bg-neon-green/10 border border-neon-green/20'}`}>
                            {t.status === 'fraud' ? '🚨' : '✅'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 truncate">{t.merchant}</p>
                            <p className="text-xs text-white/30">{t.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">${Number(t.amount).toLocaleString()}</p>
                            <span className={`badge-${t.risk_level} text-xs`}>{t.risk_level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── DETECT ───────────────────────────────────── */}
          {activeTab === 'detect' && (
            <motion.div key="detect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-2xl mx-auto glass border border-neon-blue/15 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-xl">🔍</div>
                  <div>
                    <h2 className="font-cyber text-white font-bold">Fraud Detection</h2>
                    <p className="text-white/40 text-xs">Enter transaction details for AI analysis</p>
                  </div>
                </div>
                <TransactionForm onSuccess={() => { toast.success('Transaction saved!'); loadData() }} />
              </div>
            </motion.div>
          )}

          {/* ── UPLOAD ───────────────────────────────────── */}
          {activeTab === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-2xl mx-auto glass border border-neon-blue/15 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-xl">📂</div>
                  <div>
                    <h2 className="font-cyber text-white font-bold">Bulk CSV Analysis</h2>
                    <p className="text-white/40 text-xs">Upload up to 100 transactions for batch processing</p>
                  </div>
                </div>
                <CSVUpload onResults={(r) => toast.success(`Analyzed ${r.results?.length} transactions. ${r.fraud_count} fraud detected.`)} />
              </div>
            </motion.div>
          )}

          {/* ── HISTORY ──────────────────────────────────── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-cyber text-white font-bold">Detection History</h2>
                <a href={txnAPI.export({})} className="btn-outline py-2 px-4 text-xs flex items-center gap-2">
                  ⬇️ Export CSV
                </a>
              </div>
              <DataTable
                data={txns}
                columns={txnColumns}
                onExport={() => window.open(txnAPI.export({}))}
              />
            </motion.div>
          )}

          {/* ── PROFILE ──────────────────────────────────── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-xl mx-auto glass border border-neon-blue/15 rounded-xl p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple mx-auto mb-4 flex items-center justify-center text-3xl font-bold shadow-neon-blue">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="font-cyber text-xl font-bold text-white">{user?.name}</h2>
                  <p className="text-white/40 text-sm">{user?.email}</p>
                  <span className={`badge-${user?.role === 'admin' ? 'fraud' : 'safe'} mt-2 inline-block`}>
                    {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'User ID',      val: `#${user?.id}` },
                    { label: 'Email',        val: user?.email },
                    { label: 'Phone',        val: user?.phone || 'Not set' },
                    { label: 'Role',         val: user?.role?.toUpperCase() },
                    { label: 'Total Transactions', val: n(summary.total_transactions) || txns.length },
                    { label: 'Fraud Detected',     val: n(summary.fraud_count) || txns.filter(t => t.status === 'fraud').length },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-white/40 text-sm font-cyber text-xs tracking-wider uppercase">{label}</span>
                      <span className="text-white/80 text-sm font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

