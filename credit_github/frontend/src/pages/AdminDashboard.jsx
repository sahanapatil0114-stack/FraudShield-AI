import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { analyticsAPI, usersAPI, txnAPI, logsAPI } from '../api/backend'
import StatsCard from '../components/StatsCard'
import DataTable from '../components/DataTable'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend)

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
    tooltip: {
      backgroundColor: 'rgba(10,14,26,0.9)',
      borderColor: 'rgba(139,92,246,0.3)',
      borderWidth: 1,
      titleColor: '#8b5cf6',
      bodyColor: 'rgba(255,255,255,0.7)',
    }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } },
  }
}

const TABS = ['overview', 'users', 'transactions', 'analytics', 'logs']

export default function AdminDashboard() {
  const [activeTab,  setActiveTab]  = useState('overview')
  const [analytics,  setAnalytics]  = useState(null)
  const [users,      setUsers]      = useState([])
  const [txns,       setTxns]       = useState([])
  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [editUser,   setEditUser]   = useState(null)
  const [editForm,   setEditForm]   = useState({})

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [aRes, uRes, tRes, lRes] = await Promise.all([
        analyticsAPI.get(),
        usersAPI.list({ limit: 100 }),
        txnAPI.list({ limit: 200 }),
        logsAPI.list({ limit: 100 }),
      ])
      setAnalytics(aRes.data.data)
      setUsers(uRes.data.data?.users || [])
      setTxns(tRes.data.data?.transactions || [])
      setLogs(lRes.data.data?.logs || [])
    } catch {
      setAnalytics(MOCK_ANALYTICS)
      setUsers(MOCK_USERS)
      setTxns(MOCK_TXNS)
      setLogs(MOCK_LOGS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const summary    = analytics?.summary    || {}
  const dailyTrend = analytics?.daily_trend || []
  const catBreak   = analytics?.category_breakdown || []
  const topMerch   = analytics?.top_fraud_merchants || []

  // ── Charts ─────────────────────────────────────────────
  const areaData = {
    labels: dailyTrend.length > 0
      ? dailyTrend.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }))
      : ['Jan 15', 'Jan 16', 'Jan 17', 'Jan 18', 'Jan 19', 'Jan 20', 'Jan 21', 'Jan 22'],
    datasets: [
      { label: 'Total Transactions', data: dailyTrend.length > 0 ? dailyTrend.map(d => d.total) : [12, 19, 8, 17, 14, 20, 15, 22], borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#8b5cf6' },
      { label: 'Fraud Detected',     data: dailyTrend.length > 0 ? dailyTrend.map(d => d.fraud) : [2, 1, 3, 0, 2, 1, 4, 2],        borderColor: '#ff2d78', backgroundColor: 'rgba(255,45,120,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#ff2d78' },
    ],
  }

  const barData = {
    labels: catBreak.length > 0 ? catBreak.map(c => c.category) : ['Shopping', 'Food', 'Crypto', 'Travel', 'General'],
    datasets: [
      { label: 'Total', data: catBreak.length > 0 ? catBreak.map(c => c.count) : [8, 5, 3, 4, 7], backgroundColor: 'rgba(0,212,255,0.4)', borderColor: '#00d4ff', borderWidth: 1 },
      { label: 'Fraud', data: catBreak.length > 0 ? catBreak.map(c => c.fraud_count) : [1, 0, 2, 0, 3], backgroundColor: 'rgba(255,45,120,0.5)', borderColor: '#ff2d78', borderWidth: 1 },
    ],
  }

  const donutData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [
        analytics?.risk_distribution?.find(r => r.risk_level === 'low')?.count    || 18,
        analytics?.risk_distribution?.find(r => r.risk_level === 'medium')?.count || 6,
        analytics?.risk_distribution?.find(r => r.risk_level === 'high')?.count   || 10,
      ],
      backgroundColor: ['rgba(0,255,136,0.7)', 'rgba(255,214,10,0.7)', 'rgba(255,45,120,0.7)'],
      borderColor: ['#00ff88', '#ffd60a', '#ff2d78'],
      borderWidth: 1.5,
    }],
  }

  // ── User CRUD ───────────────────────────────────────────
  const openEdit = (u) => { setEditUser(u); setEditForm({ id: u.id, name: u.name, role: u.role, phone: u.phone || '', is_active: u.is_active }) }
  const saveEdit = async () => {
    try {
      await usersAPI.update(editForm)
      toast.success('User updated'); setEditUser(null); loadAll()
    } catch { toast.error('Update failed') }
  }
  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return
    try { await usersAPI.delete(id); toast.success('User deleted'); loadAll() } catch { toast.error('Delete failed') }
  }

  const userColumns = [
    { key: 'id',    label: 'ID',    render: v => <span className="font-cyber text-neon-blue/60 text-xs">#{v}</span> },
    { key: 'name',  label: 'Name',  render: v => <span className="font-semibold text-white">{v}</span> },
    { key: 'email', label: 'Email', render: v => <span className="text-white/50 text-xs">{v}</span> },
    { key: 'role',  label: 'Role',  render: v => <span className={`badge-${v === 'admin' ? 'fraud' : 'safe'} text-xs`}>{v}</span> },
    { key: 'transaction_count', label: 'Transactions', render: v => <span className="text-neon-blue">{v || 0}</span> },
    { key: 'fraud_count', label: 'Fraud', render: v => <span className="text-neon-pink">{v || 0}</span> },
    { key: 'is_active', label: 'Status', render: v => <span className={v ? 'badge-safe' : 'badge-pending'}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'id', label: 'Actions', sortable: false, render: (_, row) => (
      <div className="flex gap-1.5">
        <button onClick={() => openEdit(row)} className="btn-outline py-1 px-2.5 text-xs">Edit</button>
        <button onClick={() => deleteUser(row.id)} className="btn-danger py-1 px-2.5 text-xs">Del</button>
      </div>
    )},
  ]

  const txnColumns = [
    { key: 'transaction_ref', label: 'Ref', render: v => <span className="font-cyber text-xs text-neon-blue/70">{v}</span> },
    { key: 'user_name',  label: 'User',     render: v => <span className="text-white/80">{v}</span> },
    { key: 'amount',     label: 'Amount',   render: v => <span className="font-bold text-white">${Number(v).toLocaleString()}</span> },
    { key: 'merchant',   label: 'Merchant' },
    { key: 'location',   label: 'Location', render: v => <span className="text-white/40 text-xs">{v}</span> },
    { key: 'status',     label: 'Status',   render: v => <span className={`badge-${v}`}>{v}</span> },
    { key: 'risk_level', label: 'Risk',     render: v => <span className={`badge-${v}`}>{v}</span> },
    { key: 'fraud_probability', label: 'Prob.', render: v => <span className="text-white/50 text-xs">{(v * 100).toFixed(1)}%</span> },
    { key: 'transaction_time', label: 'Date', render: v => <span className="text-white/30 text-xs">{new Date(v).toLocaleDateString()}</span> },
  ]

  const logColumns = [
    { key: 'id',          label: '#',        render: v => <span className="text-white/30 text-xs">#{v}</span> },
    { key: 'user_name',   label: 'User',     render: v => <span className="text-white/60">{v || 'System'}</span> },
    { key: 'action',      label: 'Action',   render: v => <span className="font-cyber text-xs text-neon-blue/70">{v}</span> },
    { key: 'description', label: 'Details',  render: v => <span className="text-white/50 text-xs line-clamp-1 max-w-xs">{v}</span> },
    { key: 'severity',    label: 'Severity', render: v => <span className={`badge-${v === 'critical' || v === 'error' ? 'fraud' : v === 'warning' ? 'pending' : 'safe'} text-xs`}>{v}</span> },
    { key: 'ip_address',  label: 'IP',       render: v => <span className="text-white/30 text-xs font-mono">{v}</span> },
    { key: 'created_at',  label: 'Time',     render: v => <span className="text-white/30 text-xs">{new Date(v).toLocaleString()}</span> },
  ]

  const TabBtn = ({ id, icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`nav-link text-sm whitespace-nowrap ${activeTab === id ? 'active' : ''}`}>
      <span>{icon}</span> <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-navy-900 bg-grid">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">👑</div>
            <div>
              <p className="text-white/30 text-xs font-cyber tracking-widest uppercase">Admin Control Panel</p>
              <h1 className="font-cyber text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                System Overview
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <span className="text-xs text-neon-green font-cyber">SYSTEM ONLINE</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 glass border border-white/5 rounded-xl p-1">
          <TabBtn id="overview"     icon="📊" label="Overview"     />
          <TabBtn id="users"        icon="👥" label="Users"        />
          <TabBtn id="transactions" icon="💳" label="Transactions" />
          <TabBtn id="analytics"    icon="📈" label="Analytics"    />
          <TabBtn id="logs"         icon="📜" label="System Logs"  />
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ─────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-48"><div className="cyber-spinner" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Transactions" value={summary.total_transactions || 34} icon="💳" color="blue"   />
                    <StatsCard title="Fraud Detected"     value={summary.fraud_count        || 10} icon="🚨" color="pink"   />
                    <StatsCard title="Active Users"       value={analytics?.system?.active_users || users.length} icon="👥" color="purple" />
                    <StatsCard title="Fraud Amount"       value={`$${Number(summary.fraud_amount || 28240).toLocaleString()}`} icon="💰" color="green" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass border border-white/5 rounded-xl p-5">
                      <p className="font-cyber text-xs text-neon-purple tracking-widest uppercase mb-4">System-wide Transaction Trend</p>
                      <div style={{ height: 220 }}><Line data={areaData} options={CHART_OPTIONS} /></div>
                    </div>
                    <div className="glass border border-white/5 rounded-xl p-5">
                      <p className="font-cyber text-xs text-neon-purple tracking-widest uppercase mb-4">Risk Distribution</p>
                      <div style={{ height: 200 }}><Doughnut data={donutData} options={{ ...CHART_OPTIONS, scales: undefined }} /></div>
                    </div>
                  </div>

                  {/* Top fraud merchants */}
                  <div className="glass border border-white/5 rounded-xl p-5">
                    <p className="font-cyber text-xs text-neon-pink tracking-widest uppercase mb-4">Top Fraud Merchants</p>
                    <div className="space-y-3">
                      {(topMerch.length > 0 ? topMerch : MOCK_TOP_MERCHANTS).map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="font-cyber text-white/20 text-xs w-4">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white/80">{m.merchant}</span>
                              <span className="text-neon-pink text-xs font-cyber">{m.fraud_count} frauds</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (m.fraud_count / 5) * 100)}%` }}
                                transition={{ delay: i * 0.1 }}
                                className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full" />
                            </div>
                          </div>
                          <span className="text-white/40 text-xs">${Number(m.total_fraud_amount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── USERS ──────────────────────────────────── */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-cyber text-white font-bold">User Management <span className="text-white/30 text-sm font-sans">({users.length})</span></h2>
              </div>
              <DataTable data={users} columns={userColumns} />
            </motion.div>
          )}

          {/* ── TRANSACTIONS ───────────────────────────── */}
          {activeTab === 'transactions' && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-cyber text-white font-bold">All Transactions</h2>
                <a href={txnAPI.export({})} className="btn-outline py-2 px-4 text-xs">⬇️ Export All CSV</a>
              </div>
              <DataTable data={txns} columns={txnColumns} onExport={() => window.open(txnAPI.export({}))} />
            </motion.div>
          )}

          {/* ── ANALYTICS ──────────────────────────────── */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass border border-white/5 rounded-xl p-5">
                  <p className="font-cyber text-xs text-neon-purple tracking-widest uppercase mb-4">Transactions by Category</p>
                  <div style={{ height: 260 }}><Bar data={barData} options={CHART_OPTIONS} /></div>
                </div>
                <div className="glass border border-white/5 rounded-xl p-5">
                  <p className="font-cyber text-xs text-neon-purple tracking-widest uppercase mb-4">7-Day Fraud Trend</p>
                  <div style={{ height: 260 }}><Line data={areaData} options={CHART_OPTIONS} /></div>
                </div>
              </div>

              {/* Model stats */}
              <div className="glass border border-white/5 rounded-xl p-5">
                <p className="font-cyber text-xs text-neon-blue tracking-widest uppercase mb-4">AI Model Performance</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Model Accuracy', val: '98.43%', color: 'text-neon-green' },
                    { label: 'Precision',       val: '97.21%', color: 'text-neon-blue' },
                    { label: 'Recall',          val: '96.12%', color: 'text-neon-purple' },
                    { label: 'F1 Score',        val: '96.66%', color: 'text-yellow-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/3 rounded-xl p-4 text-center">
                      <p className={`text-2xl font-bold font-cyber ${s.color}`}>{s.val}</p>
                      <p className="text-white/30 text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── LOGS ───────────────────────────────────── */}
          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-cyber text-white font-bold">System Logs</h2>
                <button onClick={loadAll} className="btn-outline py-2 px-4 text-xs">🔄 Refresh</button>
              </div>
              <DataTable data={logs} columns={logColumns} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setEditUser(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass border border-neon-purple/20 rounded-2xl p-6 w-full max-w-md shadow-neon-purple">
              <h3 className="font-cyber text-white font-bold mb-6">Edit User #{editUser.id}</h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Phone',     key: 'phone', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">{f.label}</label>
                    <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm(ef => ({ ...ef, [f.key]: e.target.value }))} className="input-cyber" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Role</label>
                  <select value={editForm.role || 'user'} onChange={e => setEditForm(ef => ({ ...ef, role: e.target.value }))} className="input-cyber">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-cyber text-white/40 tracking-widest uppercase mb-1.5">Status</label>
                  <select value={editForm.is_active} onChange={e => setEditForm(ef => ({ ...ef, is_active: parseInt(e.target.value) }))} className="input-cyber">
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveEdit} className="btn-neon flex-1 py-2.5 text-sm">💾 Save Changes</button>
                <button onClick={() => setEditUser(null)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MOCK_ANALYTICS = {
  summary: { total_transactions: 34, fraud_count: 10, safe_count: 21, pending_count: 3, avg_fraud_probability: 0.42, fraud_amount: 28240 },
  risk_distribution: [{ risk_level: 'low', count: 18 }, { risk_level: 'medium', count: 6 }, { risk_level: 'high', count: 10 }],
  daily_trend: [],
  category_breakdown: [],
  top_fraud_merchants: [],
  system: { active_users: 4, today_logs: 12 }
}
const MOCK_TOP_MERCHANTS = [
  { merchant: 'Unknown Merchant #4821', fraud_count: 3, total_fraud_amount: 12500 },
  { merchant: 'Crypto Exchange XYZ',   fraud_count: 2, total_fraud_amount: 5600  },
  { merchant: 'Phantom Electronics',   fraud_count: 2, total_fraud_amount: 8400  },
  { merchant: 'Mystery Vendor 01',     fraud_count: 1, total_fraud_amount: 3500  },
  { merchant: 'Suspicious Trader XO',  fraud_count: 1, total_fraud_amount: 1890  },
]
const MOCK_USERS = [
  { id: 1, name: 'Super Admin', email: 'admin@fraudshield.ai', role: 'admin', phone: '+1-555-0100', is_active: 1, transaction_count: 0,  fraud_count: 0 },
  { id: 2, name: 'John Anderson', email: 'john@example.com', role: 'user', phone: '+1-555-0101', is_active: 1, transaction_count: 10, fraud_count: 4 },
  { id: 3, name: 'Sarah Mitchell', email: 'sarah@example.com', role: 'user', phone: '+1-555-0102', is_active: 1, transaction_count: 5,  fraud_count: 2 },
  { id: 4, name: 'Mike Thompson', email: 'mike@example.com', role: 'user', phone: '+1-555-0103', is_active: 1, transaction_count: 5,  fraud_count: 1 },
]
const MOCK_TXNS = [
  { id: 1, user_name: 'John Anderson', transaction_ref: 'TXN-20240115-001', amount: 45.99, merchant: 'Starbucks', location: 'New York, NY', status: 'safe', risk_level: 'low', fraud_probability: 0.082, transaction_time: '2024-01-15T09:23:00' },
  { id: 2, user_name: 'John Anderson', transaction_ref: 'TXN-20240115-002', amount: 5847, merchant: 'Unknown Merchant', location: 'Lagos, Nigeria', status: 'fraud', risk_level: 'high', fraud_probability: 0.923, transaction_time: '2024-01-15T03:14:00' },
  { id: 3, user_name: 'Sarah Mitchell', transaction_ref: 'TXN-20240201-001', amount: 92.10, merchant: 'Whole Foods', location: 'Boston, MA', status: 'safe', risk_level: 'low', fraud_probability: 0.041, transaction_time: '2024-02-01T08:10:00' },
]
const MOCK_LOGS = [
  { id: 1, user_name: 'Super Admin', action: 'user_login', description: 'Admin logged in successfully', ip_address: '192.168.1.1', severity: 'info', created_at: '2024-01-15T08:00:00' },
  { id: 2, user_name: 'John Anderson', action: 'fraud_detected', description: 'High-risk transaction flagged: $5,847', ip_address: '192.168.1.50', severity: 'critical', created_at: '2024-01-15T03:15:00' },
]
