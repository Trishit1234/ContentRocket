import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import AIStudio from './pages/AIStudio'
import { CalendarPage, LibraryPage, AnalyticsPage, BrandsPage, TasksPage, CompetitorsPage, ProfilePage, SettingsPage } from './pages/WorkspacePages'
import AppLayout from './layouts/AppLayout'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthProvider'

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/forgot-password" element={<Auth mode="forgot" />} />
        <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
        <Route path="/app" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="studio" element={<AIStudio />} />
          <Route path="scripts" element={<AIStudio kind="script" />} />
          <Route path="captions" element={<AIStudio kind="caption" />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="competitors" element={<CompetitorsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
