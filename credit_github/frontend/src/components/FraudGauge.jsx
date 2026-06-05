import { useEffect, useRef, useState } from 'react'

const getRiskColor = (level) => {
  if (level === 'high')   return { stroke: '#ff2d78', text: '#ff2d78', bg: 'rgba(255,45,120,0.1)' }
  if (level === 'medium') return { stroke: '#ffd60a', text: '#ffd60a', bg: 'rgba(255,214,10,0.1)' }
  return { stroke: '#00ff88', text: '#00ff88', bg: 'rgba(0,255,136,0.1)' }
}

export default function FraudGauge({ probability = 0, riskLevel = 'low', size = 180 }) {
  const [animVal, setAnimVal] = useState(0)
  const colors = getRiskColor(riskLevel)

  // Animate on mount / change
  useEffect(() => {
    let frame
    let start = null
    const target = probability
    const duration = 900
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimVal(parseFloat((target * eased).toFixed(4)))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [probability])

  // SVG arc calculation
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38
  const strokeWidth = size * 0.065
  const circumference = Math.PI * radius  // half-circle
  const dashOffset = circumference * (1 - animVal)
  const pct = Math.round(animVal * 100)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size * 0.6 }}>
        <svg width={size} height={size * 0.65} style={{ overflow: 'visible' }}>
          {/* Background arc */}
          <path
            d={describeArc(cx, cy, radius, 180, 360)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d={describeArc(cx, cy, radius, 180, 360)}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${colors.stroke})` }}
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map(pct => {
            const angle = 180 + (pct / 100) * 180
            const rad = (angle * Math.PI) / 180
            const x1 = cx + (radius - strokeWidth / 2 - 4) * Math.cos(rad)
            const y1 = cy + (radius - strokeWidth / 2 - 4) * Math.sin(rad)
            const x2 = cx + (radius + strokeWidth / 2 + 4) * Math.cos(rad)
            const y2 = cy + (radius + strokeWidth / 2 + 4) * Math.sin(rad)
            return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1" style={{ bottom: 0 }}>
          <span className="font-cyber font-bold" style={{ fontSize: size * 0.18, color: colors.text, lineHeight: 1, textShadow: `0 0 20px ${colors.stroke}` }}>
            {pct}%
          </span>
          <span className="text-white/40 uppercase tracking-widest" style={{ fontSize: size * 0.065 }}>
            probability
          </span>
        </div>
      </div>

      {/* Risk badge */}
      <div className={`badge-${riskLevel} font-cyber text-xs tracking-widest uppercase px-4 py-1.5`}>
        {riskLevel} risk
      </div>
    </div>
  )
}

function describeArc(x, y, r, startAngle, endAngle) {
  const toRad = (d) => (d * Math.PI) / 180
  const sx = x + r * Math.cos(toRad(startAngle))
  const sy = y + r * Math.sin(toRad(startAngle))
  const ex = x + r * Math.cos(toRad(endAngle))
  const ey = y + r * Math.sin(toRad(endAngle))
  return `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`
}
