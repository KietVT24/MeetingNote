import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Topbar from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'
import NewMeeting from './pages/NewMeeting'
import AllTranscripts from './pages/Content/AllTranscripts'
import TranscriptDetail from './pages/Content/TranscriptDetail'
import SharedMeeting from './pages/Content/SharedMeeting'
import Settings from './pages/Settings'
import LandingPage from './pages/LangdingPage'
import Payment from './pages/Payment'
import AdminDashboard from './pages/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import { LanguageProvider } from './contexts/LanguageContext'

// Layout component - không có Sidebar
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Shared Meeting - No authentication required */}
          <Route path="/shared/:shareToken" element={<SharedMeeting />} />

          {/* Main Page - Lịch sử (AllTranscripts) */}
          <Route path="/meetings" element={
            <ProtectedRoute>
              <AppLayout>
                <AllTranscripts />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Payment Page */}
          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Tạo cuộc họp mới */}
          <Route path="/new-meeting" element={
            <ProtectedRoute>
              <AppLayout>
                <NewMeeting />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Chi tiết transcript */}
          <Route path="/meetings/:meetId" element={
            <ProtectedRoute>
              <AppLayout>
                <TranscriptDetail />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Settings */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Legacy routes - redirect */}
          <Route path="/home" element={<Navigate to="/meetings" replace />} />
          <Route path="/content/transcripts" element={<Navigate to="/meetings" replace />} />
          <Route path="/content/transcripts/:meetId" element={<Navigate to="/meetings/:meetId" replace />} />

          {/* Catch all - redirect to meetings */}
          <Route path="*" element={<Navigate to="/meetings" replace />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  )
}
