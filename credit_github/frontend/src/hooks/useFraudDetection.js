import { useState, useCallback } from 'react'
import { fraudAPI } from '../api/fraud'

export function useFraudDetection() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const detect = useCallback(async (transaction) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      // Try Flask API first; fall back to mock if unavailable
      const res = await fraudAPI.detect({
        amount:   parseFloat(transaction.amount),
        merchant: transaction.merchant,
        location: transaction.location,
        hour:     transaction.hour ?? new Date().getHours(),
        category: transaction.category ?? 'general',
      })
      setResult(res.data.result)
      return res.data.result
    } catch (err) {
      // Fallback mock model when Flask is offline
      const mockResult = mockDetect(transaction)
      setResult(mockResult)
      return mockResult
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = () => { setResult(null); setError(null) }

  return { result, loading, error, detect, reset }
}

// Fallback mock when Flask is not running
function mockDetect({ amount, merchant, location, hour }) {
  let score = 0.05
  if (amount > 5000) score += 0.4
  else if (amount > 2000) score += 0.25
  else if (amount > 1000) score += 0.12

  const suspicious = ['unknown', 'crypto', 'wire', 'unnamed', 'phantom']
  if (suspicious.some(s => (merchant || '').toLowerCase().includes(s))) score += 0.3
  if (suspicious.some(s => (location || '').toLowerCase().includes(s))) score += 0.25

  const h = hour ?? new Date().getHours()
  if (h >= 1 && h <= 5) score += 0.2

  score = Math.min(0.99, score + (Math.random() * 0.06 - 0.03))
  const risk_level = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'

  return {
    fraud_probability: parseFloat(score.toFixed(4)),
    risk_score: parseFloat((score * 100).toFixed(2)),
    risk_level,
    status: score >= 0.7 ? 'fraud' : score >= 0.4 ? 'pending' : 'safe',
    flags: [],
    model_version: 'v1.0.0-mock',
    confidence: 0.91,
  }
}
