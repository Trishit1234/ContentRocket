import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthProvider'

const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AIStudio = lazy(() => import('./pages/AIStudio'))
const CampaignDemo = lazy(() => import('./pages/CampaignDemo'))
const AppLayout = lazy(() => import('./layouts/AppLayout'))
const CalendarPage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.CalendarPage })))
const LibraryPage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.LibraryPage })))
const AnalyticsPage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.AnalyticsPage })))
const BrandsPage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.BrandsPage })))
const TasksPage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.TasksPage })))
const CompetitorsPage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.CompetitorsPage })))
const ProfilePage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.ProfilePage })))
const SettingsPage = lazy(() => import('./pages/WorkspacePages').then((module) => ({ default: module.SettingsPage })))

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="route-loading">Loading your creator workspace…</div>}><Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/forgot-password" element={<Auth mode="forgot" />} />
        <Route path="/reset-password/:uid/:token" element={<Auth mode="reset" />} />
        <Route path="/generate" element={<AIStudio publicMode />} />
        <Route path="/generate/scripts" element={<AIStudio kind="script" publicMode />} />
        <Route path="/generate/captions" element={<AIStudio kind="caption" publicMode />} />
        <Route path="/demo" element={<CampaignDemo />} />
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
      </Routes></Suspense>
    </AuthProvider>
  )
}
