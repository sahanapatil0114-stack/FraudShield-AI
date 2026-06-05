import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { motion, AnimatePresence } from 'framer-motion'
import { fraudAPI } from '../api/fraud'

export default function CSVUpload({ onResults }) {
  const [status,   setStatus]   = useState('idle') // idle | parsing | analyzing | done | error
  const [progress, setProgress] = useState(0)
  const [results,  setResults]  = useState(null)
  const [error,    setError]    = useState(null)

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return

    setStatus('parsing')
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const rows = parsed.data.slice(0, 100)
        if (!rows.length) { setError('CSV appears to be empty'); setStatus('error'); return }

        setStatus('analyzing')
        setProgress(0)

        try {
          const mapped = rows.map(r => ({
            amount:   parseFloat(r.amount || r.Amount || 0),
            merchant: r.merchant || r.Merchant || 'Unknown',
            location: r.location || r.Location || 'Unknown',
            category: r.category || r.Category || 'general',
            hour:     parseInt(r.hour || r.Hour || new Date().getHours()),
          }))

          // Simulate progress
          const interval = setInterval(() => setProgress(p => Math.min(90, p + 10)), 200)

          let batchResult
          try {
            const res = await fraudAPI.batchDetect(mapped)
            batchResult = res.data
          } catch {
            // Mock batch result if Flask offline
            batchResult = {
              results: mapped.map((txn, i) => ({
                transaction: { ...txn, index: i },
                analysis: mockDetect(txn)
              })),
              fraud_count: 0
            }
            batchResult.fraud_count = batchResult.results.filter(r => r.analysis.risk_level === 'high').length
          }

          clearInterval(interval)
          setProgress(100)
          setResults(batchResult)
          setStatus('done')
          onResults?.(batchResult)
        } catch (err) {
          setError('Analysis failed. Please check your CSV format.')
          setStatus('error')
        }
      },
      error: () => { setError('Failed to parse CSV file.'); setStatus('error') }
    })
  }, [onResults])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, multiple: false
  })

  const reset = () => { setStatus('idle'); setResults(null); setError(null); setProgress(0) }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="text-4xl mb-3">📂</div>
              <p className="text-white/70 font-medium mb-1">
                {isDragActive ? 'Drop your CSV here...' : 'Drag & drop your CSV file here'}
              </p>
              <p className="text-white/30 text-sm mb-3">or click to browse files</p>
              <p className="text-xs text-neon-blue/60 font-cyber">
                Required columns: amount, merchant, location | Max 100 rows
              </p>
            </div>
          </motion.div>
        )}

        {(status === 'parsing' || status === 'analyzing') && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass border border-neon-blue/20 rounded-xl p-8 text-center">
            <div className="cyber-spinner mx-auto mb-4" />
            <p className="font-cyber text-neon-blue text-sm mb-3">
              {status === 'parsing' ? 'PARSING CSV...' : 'ANALYZING TRANSACTIONS...'}
            </p>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                style={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <p className="text-white/30 text-xs mt-2">{progress}%</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass border border-neon-pink/20 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-neon-pink mb-3">{error}</p>
            <button onClick={reset} className="btn-outline text-xs py-2 px-4">Try Again</button>
          </motion.div>
        )}

        {status === 'done' && results && (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass border border-neon-green/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">✓</div>
              <div>
                <p className="font-cyber text-neon-green text-sm">ANALYSIS COMPLETE</p>
                <p className="text-white/40 text-xs">{results.results?.length} transactions processed</p>
              </div>
              <button onClick={reset} className="ml-auto btn-outline py-1.5 px-3 text-xs">Upload New</button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Total', val: results.results?.length, color: 'text-neon-blue' },
                { label: 'Fraud Detected', val: results.fraud_count, color: 'text-neon-pink' },
                { label: 'Safe', val: (results.results?.length || 0) - (results.fraud_count || 0), color: 'text-neon-green' },
              ].map(s => (
                <div key={s.label} className="bg-white/3 rounded-lg p-3 text-center">
                  <p className={`text-xl font-bold font-cyber ${s.color}`}>{s.val}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {results.results?.slice(0, 20).map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2 text-xs">
                  <span className="text-white/60 truncate max-w-32">{r.transaction.merchant}</span>
                  <span className="text-white/50">${Number(r.transaction.amount).toLocaleString()}</span>
                  <span className={`badge-${r.analysis?.risk_level || 'low'} ml-2`}>{r.analysis?.risk_level}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sample CSV template */}
      {status === 'idle' && (
        <p className="text-xs text-white/25 text-center">
          Need a template?{' '}
          <a href="data:text/csv;charset=utf-8,amount,merchant,location,category%0A150.00,Amazon,New York NY,shopping%0A5500.00,Unknown Vendor,Lagos Nigeria,general%0A45.99,Starbucks,Chicago IL,food"
            download="sample_transactions.csv"
            className="text-neon-blue/60 hover:text-neon-blue underline">
            Download sample CSV
          </a>
        </p>
      )}
    </div>
  )
}

function mockDetect({ amount, merchant, location }) {
  let score = 0.05
  if (amount > 5000) score += 0.4
  else if (amount > 2000) score += 0.25
  const suspicious = ['unknown', 'crypto', 'unnamed', 'phantom', 'wire']
  if (suspicious.some(s => (merchant || '').toLowerCase().includes(s))) score += 0.3
  if (suspicious.some(s => (location || '').toLowerCase().includes(s))) score += 0.25
  score = Math.min(0.99, score + (Math.random() * 0.06 - 0.03))
  const risk_level = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'
  return { fraud_probability: score, risk_level, risk_score: score * 100, status: score >= 0.7 ? 'fraud' : 'safe' }
}
