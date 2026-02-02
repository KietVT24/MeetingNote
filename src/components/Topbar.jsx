import { useUI } from '../store/ui'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Brain, Settings } from 'lucide-react'

export default function Topbar() {
  const { lang, setLang } = useUI()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/meetings')}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <Brain size={22} color='white' />
        </div>
        <div className="hidden sm:block">
          <div className="text-lg font-bold text-cyan-900">XinK Meeting AI</div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Language Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-full text-sm transition-all ${lang === 'en' ? 'bg-white shadow font-medium' : 'text-gray-600 hover:text-gray-800'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('vi')}
            className={`px-3 py-1 rounded-full text-sm transition-all ${lang === 'vi' ? 'bg-white shadow font-medium' : 'text-gray-600 hover:text-gray-800'}`}
          >
            VI
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className={`p-2 rounded-lg transition-colors ${location.pathname === '/settings' ? 'bg-cyan-100 text-cyan-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
          title="Cài đặt"
        >
          <Settings size={20} />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-gray-800">{user?.name || 'User'}</div>
            <div className="text-xs text-emerald-600">Free Plan</div>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-200">
            <img src="/icon_xinkmeet.png" alt="" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
