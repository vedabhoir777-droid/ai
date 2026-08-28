import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import AdminSidebar from './components/AdminSidebar'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Analysis from './pages/Analysis'
import Chat from './pages/Chat'
import History from './pages/History'
import RiskAnalysis from './pages/RiskAnalysis'
import ClauseReview from './pages/ClauseReview'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminDrivers from './pages/admin/AdminDrivers'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminSettings from './pages/admin/AdminSettings'
import Loader from './components/Loader'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader message="Loading..." />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader message="Loading..." />
  if (!user) return <Navigate to="/admin/login" replace />
  if (profile && profile.role !== 'super_admin') return <Navigate to="/dashboard" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-area">
        <Navbar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

function LandingLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/signup'
  const isAdminLogin = location.pathname === '/admin/login'
  const isAdmin = location.pathname.startsWith('/admin') && !isAdminLogin

  if (isLanding) {
    return (
      <LandingLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </LandingLayout>
    )
  }

  if (isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
      </Routes>
    )
  }

  if (isAdminLogin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    )
  }

  if (isAdmin) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/drivers" element={<AdminRoute><AdminDrivers /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/analysis/:id" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/risk-analysis" element={<ProtectedRoute><RiskAnalysis /></ProtectedRoute>} />
        <Route path="/clause-review" element={<ProtectedRoute><ClauseReview /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}