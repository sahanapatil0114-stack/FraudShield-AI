import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFraudDetection } from '../hooks/useFraudDetection'
import { txnAPI } from '../api/backend'
import FraudGauge from './FraudGauge'
import toast from 'react-hot-toast'

const CATEGORIES = ['food', 'shopping', 'electronics', 'travel', 'fuel', 'groceries', 'subscription', 'healthcare', 'crypto', 'transfer', 'general']

export default function TransactionForm({ onSuccess }) {
  const [form, setForm] = useState({
    amount: '', merchant: '', location: '', category: 'general', card_last4: ''
  })
  const { result, loading, detect, reset } = useFraudDetection()
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (result) reset()
  }

  const handleDetect = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.merchant || !form.location) {
      toast.error('Please fill in amount, merchant, and location')
      return
    }
    await detect({ ...form, amount: parseFloat(form.amount) })
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      await txnAPI.create({
        ...form,
        amount: parseFloat(form.amount),
        status: result.status,
        risk_score: result.risk_score,
        risk_level: result.risk_level,
        fraud_probability: result.fraud_probability,
      })
      toast.success('Transaction saved to history!')
      onSuccess?.()
      setForm({ amount: '', merchant: '', location: '', category: 'general', card_last4: '' })
      reset()
    } catch (err) {
      toast.error('Failed to save transaction. Check backend connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleDetect} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 font-cyber tracking-widest uppercase mb-1.5">Amount ($)</label>
            <input name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={handleChange}
              placeholder="0.00" className="input-cyber" required />
          </div>
          <div>
            <label className="block text-xs text-white/40 font-cyber tracking-widest uppercase mb-1.5">Card Last 4 Digits</label>
            <input name="card_last4" type="text" maxLength={4} value={form.card_last4} onChange={handleChange}
              placeholder="4532" className="input-cyber" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 font-cyber tracking-widest uppercase mb-1.5">Merchant Name</label>
          <input name="merchant" type="text" value={form.merchant} onChange={handleChange}
            placeholder="e.g. Amazon, Starbucks, Unknown Vendor" className="input-cyber" required />
        </div>

        <div>
          <label className="block text-xs text-white/40 font-cyber tracking-widest uppercase mb-1.5">Location</label>
          <input name="location" type="text" value={form.location} onChange={handleChange}
            placeholder="e.g. New York, NY / Lagos, Nigeria" className="input-cyber" required />
        </div>

        <div>
          <label className="block text-xs text-white/40 font-cyber tracking-widest uppercase mb-1.5">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-cyber">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn-neon w-full py-3 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ANALYZING...
            </>
          ) : '🔍 ANALYZE TRANSACTION'}
        </button>
      </form>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`glass rounded-xl p-5 border ${result.risk_level === 'high' ? 'border-neon-pink/30' : result.risk_level === 'medium' ? 'border-yellow-500/30' : 'border-neon-green/30'}`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <FraudGauge probability={result.fraud_probability} riskLevel={result.risk_level} size={160} />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-cyber text-xs text-white/40 tracking-widest uppercase mb-1">Detection Result</p>
                  <p className={`text-2xl font-bold font-cyber ${result.risk_level === 'high' ? 'text-neon-pink' : result.risk_level === 'medium' ? 'text-yellow-400' : 'text-neon-green'}`}>
                    {result.risk_level === 'high' ? '🚨 FRAUD DETECTED' : result.risk_level === 'medium' ? '⚠️ SUSPICIOUS' : '✅ SAFE TRANSACTION'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Fraud Prob.', val: `${(result.fraud_probability * 100).toFixed(1)}%` },
                    { label: 'Risk Score', val: `${result.risk_score?.toFixed(1)}/100` },
                    { label: 'Risk Level', val: result.risk_level?.toUpperCase() },
                    { label: 'Model', val: result.model_version },
                  ].map(s => (
                    <div key={s.label} className="bg-white/3 rounded-lg p-2.5">
                      <p className="text-white/30 text-xs uppercase tracking-wider">{s.label}</p>
                      <p className="text-white/80 font-semibold text-sm mt-0.5">{s.val}</p>
                    </div>
                  ))}
                </div>
                {result.flags?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-white/30 font-cyber uppercase tracking-wider">Risk Flags</p>
                    {result.flags.map((f, i) => (
                      <p key={i} className="text-xs text-neon-pink/80 flex items-center gap-1.5">
                        <span>⚡</span> {f}
                      </p>
                    ))}
                  </div>
                )}
                <button onClick={handleSave} disabled={saving} className="btn-neon w-full py-2.5 text-xs flex items-center justify-center gap-2">
                  {saving ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : '💾 SAVE TO HISTORY'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
