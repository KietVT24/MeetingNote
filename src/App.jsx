import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Topbar from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'
import NewMeeting from './pages/NewMeeting'
import AllTranscripts from './pages/Content/AllTranscripts'
import TranscriptDetail from './pages/Content/TranscriptDetail'
import Settings from './pages/Settings'
import LandingPage from './pages/LangdingPage'
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

          {/* Main Page - Lịch sử (AllTranscripts) */}
          <Route path="/meetings" element={
            <ProtectedRoute>
              <AppLayout>
                <AllTranscripts />
              </AppLayout>
            </ProtectedRoute>
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
