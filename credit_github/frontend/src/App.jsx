import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import VoiceAssistant from './components/VoiceAssistant'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

function Layout({ children, showNav = true }) {
  return (
    <div>
      {showNav && <Navbar />}
      <main>{children}</main>
      <VoiceAssistant />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(10,14,26,0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#00ff88', secondary: '#0a0e1a' },
              style: { borderColor: 'rgba(0,255,136,0.25)' },
            },
            error: {
              iconTheme: { primary: '#ff2d78', secondary: '#0a0e1a' },
              style: { borderColor: 'rgba(255,45,120,0.25)' },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <Layout><Landing /></Layout>
          } />
          <Route path="/login" element={
            <Layout showNav={false}><Login /></Layout>
          } />
          <Route path="/register" element={
            <Layout showNav={false}><Register /></Layout>
          } />

          {/* User protected route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><UserDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin protected route */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
