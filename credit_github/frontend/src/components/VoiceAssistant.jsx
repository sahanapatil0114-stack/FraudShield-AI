import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useVoiceAssistant } from '../hooks/useVoiceAssistant'

export default function VoiceAssistant() {
  const [open, setOpen]   = useState(false)
  const [input, setInput] = useState('')
  const bottomRef         = useRef(null)
  const { messages, listening, thinking, supported, sendMessage, startListening, stopListening } = useVoiceAssistant()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-neon flex items-center justify-center shadow-neon-blue"
        title="FraudShield Assistant"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96"
          >
            <div className="glass border border-neon-blue/20 rounded-2xl overflow-hidden shadow-neon-blue flex flex-col"
                 style={{ height: '480px' }}>
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/5 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm">
                  🛡️
                </div>
                <div>
                  <p className="font-cyber text-xs text-neon-blue">FRAUDSHIELD AI</p>
                  <p className="text-xs text-white/40">Assistant · Online</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-xs text-neon-green">Active</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={msg.role === 'user' ? 'chat-msg-user self-end text-white' : 'chat-msg-bot text-white/80'}
                  >
                    {msg.role === 'bot' && (
                      <span className="text-neon-blue text-xs font-cyber block mb-1">AI ·</span>
                    )}
                    {msg.text}
                  </motion.div>
                ))}
                {thinking && (
                  <div className="chat-msg-bot flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Voice waveform */}
              {listening && (
                <div className="px-4 pb-2 flex items-center gap-2">
                  <div className="voice-waveform flex items-end gap-1 h-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ height: `${8 + Math.random() * 16}px` }} />
                    ))}
                  </div>
                  <span className="text-xs text-neon-blue font-cyber">LISTENING...</span>
                </div>
              )}

              {/* Input bar */}
              <div className="p-3 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about fraud detection..."
                  className="input-cyber flex-1 text-sm py-2"
                />
                {supported && (
                  <button
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${listening ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30' : 'bg-white/5 text-white/40 border border-white/10 hover:text-neon-blue hover:border-neon-blue/30'}`}
                    title="Hold to speak"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center hover:shadow-neon-blue transition-all"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
