/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#02040d',
          900: '#0a0e1a',
          800: '#0d1225',
          700: '#111830',
          600: '#1a2340',
          500: '#243050',
        },
        neon: {
          blue:   '#00d4ff',
          purple: '#8b5cf6',
          green:  '#00ff88',
          pink:   '#ff2d78',
          yellow: '#ffd60a',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        'hero-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.1) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'neon-glow': 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
      },
      boxShadow: {
        'neon-blue':   '0 0 20px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)',
        'neon-purple': '0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
        'neon-green':  '0 0 20px rgba(0,255,136,0.3)',
        'neon-pink':   '0 0 20px rgba(255,45,120,0.3)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
      },
      animation: {
        'pulse-neon':    'pulseNeon 2s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'scanline':      'scanline 4s linear infinite',
        'data-stream':   'dataStream 3s linear infinite',
        'glow-rotate':   'glowRotate 4s linear infinite',
        'counter':       'counter 1s ease-out forwards',
        'slide-in-up':   'slideInUp 0.5s ease-out',
        'slide-in-right':'slideInRight 0.4s ease-out',
        'fade-in':       'fadeIn 0.3s ease-out',
        'spin-slow':     'spin 8s linear infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%,100%': { opacity: '1', boxShadow: '0 0 20px rgba(0,212,255,0.3)' },
          '50%':     { opacity: '0.8', boxShadow: '0 0 40px rgba(0,212,255,0.6), 0 0 80px rgba(0,212,255,0.2)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-20px)' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        dataStream: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '50%':  { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        glowRotate: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideInUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
