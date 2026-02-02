
import { NavLink } from 'react-router-dom'
import { useUI } from '../store/ui'
import { Brain } from 'lucide-react'
import { Home, Languages, BarChart3, History, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const Item = ({ to, icon: Icon, label, className = '' }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      'flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition-colors ' +
      (isActive ? 'bg-cyan-600 text-white shadow-md' : 'text-cyan-800 hover:bg-cyan-50') +
      ' ' + className
    }
  >
    <Icon size={18} />
    <span className="truncate">{label}</span>
  </NavLink>
)
export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI()
  return (
    <aside className={`h-screen bg-white sticky top-0 shadow-custom transition-all ${sidebarOpen ? 'w-64' : 'w-[76px]'} px-3 m-2 rounded-2xl`}>
      <div className="flex items-center gap-2 h-16 m-2">
        <div className="w-9 h-9 m-2 rounded-xl bg-cyan-500 flex items-center justify-center">            <Brain size={30} color='white' />
        </div>
        {sidebarOpen && (
          <div>
            <div className="font-semibold text-[20px] text-cyan-900">XinK Meet</div>
            {/* <div className="text-[12px] text-cyan-700/70 -mt-1">Made by XinK Group</div> */}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <Item to="/home" icon={Home} label="Home" />

        <Item to="/content/transcripts" icon={History} label="History" className={sidebarOpen ? 'pl-3' : ''} />
        <Item to="/live" icon={Languages} label="Live Extension Translation" />
        <Item to="/analytics" icon={BarChart3} label="Analytics" />
        <Item to="/settings" icon={Settings} label="Settings" />
      </div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-1/2 bg-white border shadow rounded-full w-7 h-7 flex items-center justify-center">
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

    </aside>
  )
}
