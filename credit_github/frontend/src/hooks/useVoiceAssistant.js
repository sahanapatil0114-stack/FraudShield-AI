import { useState, useEffect, useRef } from 'react'

const FRAUD_KB = [
  { keys: ['what is fraud', 'define fraud', 'credit card fraud'],
    answer: 'Credit card fraud is any unauthorized use of your credit card information to make purchases or withdraw funds. Our AI model detects anomalies in transaction patterns to flag potentially fraudulent activity in real-time.' },
  { keys: ['how does it work', 'how detection works', 'algorithm', 'model'],
    answer: 'FraudShield AI analyzes multiple factors: transaction amount, merchant history, geographic location, time of day, and spending patterns. It scores each transaction from 0 to 100%, flagging those above a threshold as potential fraud.' },
  { keys: ['risk level', 'high risk', 'low risk', 'medium risk'],
    answer: 'Risk levels: LOW (0-40% probability) — transaction appears normal. MEDIUM (40-70%) — some suspicious indicators, review recommended. HIGH (70-100%) — strong fraud indicators, immediate action required.' },
  { keys: ['upload', 'csv', 'bulk', 'file'],
    answer: 'You can upload a CSV file with your transactions in the dashboard. The file should have columns: amount, merchant, location, and optionally: category, date, card_last4.' },
  { keys: ['false positive', 'wrong detection', 'incorrect'],
    answer: 'False positives occur when legitimate transactions are flagged as fraud. If you believe a transaction was incorrectly flagged, you can review it in your detection history and the model will learn over time.' },
  { keys: ['protect', 'safe', 'security', 'secure'],
    answer: 'To stay protected: (1) Monitor your transactions regularly, (2) Enable fraud alerts in your profile, (3) Use the dashboard to review any flagged transactions promptly, (4) Report suspicious activity immediately.' },
  { keys: ['dashboard', 'navigate', 'guide', 'help'],
    answer: 'The dashboard has: Overview (stats & charts), Detect (submit transactions), History (past results), and Profile. Admins also have User Management, Analytics, and System Logs sections.' },
  { keys: ['export', 'download', 'report', 'pdf'],
    answer: 'You can export your transaction history as a CSV file from the History section. Use the Export button and apply filters before exporting to get specific data.' },
  { keys: ['hello', 'hi', 'hey', 'greetings'],
    answer: 'Hello! I\'m FraudShield Assistant. I can help you understand fraud detection, navigate the dashboard, or explain any detection results. What would you like to know?' },
  { keys: ['thank', 'thanks'],
    answer: 'You\'re welcome! Stay vigilant and let me know if you need anything else. Your financial security is our priority.' },
]

function findAnswer(query) {
  const q = query.toLowerCase()
  for (const entry of FRAUD_KB) {
    if (entry.keys.some(k => q.includes(k))) return entry.answer
  }
  return "I'm not sure about that specific query. Try asking about fraud detection, risk levels, how to use the dashboard, or how to upload CSV files. You can also contact support for complex issues."
}

export function useVoiceAssistant() {
  const [messages, setMessages]   = useState([
    { role: 'bot', text: 'Hello! I\'m FraudShield AI Assistant. Ask me anything about fraud detection, your dashboard, or security tips! 🛡️' }
  ])
  const [listening, setListening] = useState(false)
  const [thinking, setThinking]   = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSupported(true)
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'
      rec.onresult  = (e) => sendMessage(e.results[0][0].transcript)
      rec.onend     = () => setListening(false)
      rec.onerror   = () => setListening(false)
      recognitionRef.current = rec
    }
  }, [])

  const speak = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 0.8
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'))
    if (preferred) utterance.voice = preferred
    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setThinking(true)
    setTimeout(() => {
      const answer = findAnswer(text)
      setMessages(prev => [...prev, { role: 'bot', text: answer }])
      setThinking(false)
      speak(answer)
    }, 800)
  }

  const startListening = () => {
    if (!recognitionRef.current) return
    setListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setListening(false)
  }

  return { messages, listening, thinking, supported, sendMessage, startListening, stopListening }
}
