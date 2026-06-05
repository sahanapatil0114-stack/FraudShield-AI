import { motion } from 'framer-motion'

export default function StatsCard({ title, value, icon, subtitle, color = 'blue', trend }) {
  const colorMap = {
    blue:   { border: 'border-neon-blue/20', glow: 'shadow-neon-blue', text: 'text-neon-blue', bg: 'bg-neon-blue/5' },
    purple: { border: 'border-neon-purple/20', glow: 'shadow-neon-purple', text: 'text-neon-purple', bg: 'bg-neon-purple/5' },
    green:  { border: 'border-neon-green/20', glow: 'shadow-neon-green', text: 'text-neon-green', bg: 'bg-neon-green/5' },
    pink:   { border: 'border-neon-pink/20', glow: 'shadow-neon-pink', text: 'text-neon-pink', bg: 'bg-neon-pink/5' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass glass-hover ${c.border} border p-5 rounded-xl relative overflow-hidden`}
    >
      {/* BG glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.bg} blur-2xl`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-white/40 text-xs font-cyber tracking-widest uppercase mb-1">{title}</p>
          <p className={`text-2xl font-bold font-cyber ${c.text}`}>{value}</p>
          {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-neon-pink' : 'text-neon-green'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
