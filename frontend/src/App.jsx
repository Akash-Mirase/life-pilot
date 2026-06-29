import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { TaskProvider } from './contexts/TaskContext'
import AppLayout from './components/layout/AppLayout.jsx'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import AIPlanner from './pages/AIPlanner'
import { Calendar } from './pages/Calendar'
import Analytics from './pages/Analytics'
import Habits from './pages/Habits'
import { Voice, Notifications, Settings, Profile } from './pages/OtherPages'

function ProtectedRoute ({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to='/login' replace />
}

function PublicRoute ({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to='/dashboard' replace /> : children
}

function AppRoutes () {
  return (
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route
        path='/login'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path='/register'
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/tasks' element={<Tasks />} />
        <Route path='/ai-planner' element={<AIPlanner />} />
        <Route path='/calendar' element={<Calendar />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/habits' element={<Habits />} />
        <Route path='/voice' element={<Voice />} />
        <Route path='/notifications' element={<Notifications />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/profile' element={<Profile />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default function App () {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <AppRoutes />
          <Toaster
            position='top-right'
            toastOptions={{
              style: {
                background: '#1e1e2e',
                color: '#f1f5f9',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 12
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#1e1e2e' }
              },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1e1e2e' } }
            }}
          />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
