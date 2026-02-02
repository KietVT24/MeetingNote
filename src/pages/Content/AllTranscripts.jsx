import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMeetingsWithAnalyses, meetingsApi } from '../../services/meetings'
import {
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Video,
  Calendar,
  Users,
  Clock,
  Brain,
  FileText,
  ListTodo,
  CheckCircle,
  AlertCircle,
  Loader2,
  History,
  ChevronRight,
  Plus
} from 'lucide-react'

function Glow() {
  return <div className="absolute inset-0 -z-10 blur-3xl opacity-40 pointer-events-none">
    <div className="absolute top-10 left-20 w-72 h-72 rounded-full gradient-background-orange" />
    <div className="absolute bottom-[35rem] right-[20rem] w-56 h-56 rounded-full gradient-background-purple" />
    <div className="absolute bottom-[45.5rem] right-[45rem] w-56 h-56 rounded-full gradient-background-green" />
    <div className="absolute bottom-30 right-10 w-64 h-64 rounded-full gradient-background-1" />
  </div>
}

export default function AllTranscripts() {
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [stats, setStats] = useState({ total: 0, active: 0, ended: 0, withAnalysis: 0 })

  // Fetch meetings with analyses from backend API
  const fetchMeetings = useCallback(async () => {
    try {
      setError('')
      const data = await getMeetingsWithAnalyses({
        limit: 100,
        offset: 0,
        status: statusFilter || undefined
      })
      const meetingsList = data.meetings || []
      setMeetings(meetingsList)

      // Calculate stats
      setStats({
        total: meetingsList.length,
        active: meetingsList.filter(m => m.status === 'active').length,
        ended: meetingsList.filter(m => m.status === 'ended').length,
        withAnalysis: meetingsList.filter(m => m.latestAnalysis).length
      })
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách cuộc họp')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchMeetings()
  }

  // Handle delete meeting
  const handleDelete = async (meetId, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Bạn có chắc muốn xóa cuộc họp này?')) return

    setDeletingId(meetId)
    try {
      await meetingsApi.delete(meetId)
      setMeetings(prev => prev.filter(m => m.meet_id !== meetId))
    } catch (err) {
      setError(`Không thể xóa cuộc họp: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Handle click meeting - navigate to detail page
  const handleMeetingClick = (meeting) => {
    navigate(`/meetings/${meeting.meet_id}`)
  }

  // Filter meetings by search query
  const filteredMeetings = meetings.filter(m => {
    if (!q) return true
    const query = q.toLowerCase()
    return (
      m.meet_id?.toLowerCase().includes(query) ||
      m.title?.toLowerCase().includes(query) ||
      m.latestAnalysis?.summary?.toLowerCase().includes(query)
    )
  })

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Live
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <CheckCircle size={10} />
        Ended
      </span>
    )
  }

  // Get platform badge
  const getPlatformBadge = (platform) => {
    const configs = {
      google_meet: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Google Meet' },
      teams: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'MS Teams' },
      zoom: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Zoom' }
    }
    const config = configs[platform] || configs.google_meet
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-6 relative">
      <Glow />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-semibold flex items-center gap-2 text-cyan-900">
            <History size={24} />
            Các cuộc họp của bạn
          </div>
          <div className="text-sm text-cyan-800/80 mt-1">
            Click vào cuộc họp để xem chi tiết transcript và phân tích
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button
            onClick={() => navigate('/new-meeting')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium shadow-lg hover:from-cyan-600 hover:to-cyan-700 transition-all"
          >
            <Plus size={18} />
            Tạo cuộc họp mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white shadow-lg">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-cyan-100 flex items-center gap-1">
            <Calendar size={14} /> Tổng meetings
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-lg">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-sm text-green-100 flex items-center gap-1">
            <Clock size={14} /> Đang diễn ra
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 p-4 text-white shadow-lg">
          <div className="text-2xl font-bold">{stats.ended}</div>
          <div className="text-sm text-gray-200 flex items-center gap-1">
            <CheckCircle size={14} /> Đã kết thúc
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-lg">
          <div className="text-2xl font-bold">{stats.withAnalysis}</div>
          <div className="text-sm text-purple-100 flex items-center gap-1">
            <Brain size={14} /> Có phân tích
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-cyan-200/60 rounded-xl px-4 py-2.5 flex-1">
          <Search size={18} className="text-cyan-500" />
          <input
            className="outline-none flex-1 text-sm bg-transparent"
            placeholder="Tìm kiếm cuộc họp..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-cyan-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-cyan-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="active">Đang diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-600">
          <Loader2 size={40} className="animate-spin mb-4" />
          <span>Đang tải danh sách từ database...</span>
        </div>
      ) : filteredMeetings.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
          <History size={64} className="mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">Chưa có cuộc họp nào</h3>
          <p className="text-sm text-gray-400 text-center max-w-md">
            {q
              ? 'Không tìm thấy cuộc họp phù hợp với tìm kiếm của bạn'
              : 'Khi bạn tạo bot tham gia cuộc họp, cuộc họp sẽ được lưu vào đây'
            }
          </p>
        </div>
      ) : (
        /* Meetings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMeetings.map(meeting => (
            <div
              key={meeting.id || meeting.meet_id}
              onClick={() => handleMeetingClick(meeting)}
              className="rounded-2xl border border-cyan-200/60 shadow-sm hover:shadow-lg hover:border-cyan-300 transition-all p-5 bg-white cursor-pointer group relative"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => handleDelete(meeting.meet_id, e)}
                disabled={deletingId === meeting.meet_id}
                className="absolute top-3 right-3 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10"
                title="Xóa cuộc họp"
              >
                {deletingId === meeting.meet_id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meeting.status === 'active' ? 'bg-green-100' : 'bg-cyan-100'}`}>
                  <Video size={20} className={meeting.status === 'active' ? 'text-green-600' : 'text-cyan-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-cyan-900 truncate">
                    {meeting.title || `Meeting ${meeting.meet_id}`}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {meeting.meet_id}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-cyan-500 transition-colors" />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {getStatusBadge(meeting.status)}
                {getPlatformBadge(meeting.platform)}
                {meeting.latestAnalysis && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 flex items-center gap-1">
                    <Brain size={10} /> AI
                  </span>
                )}
              </div>

              {/* Analysis Preview - nếu có */}
              {meeting.latestAnalysis ? (
                <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl p-3 mb-3 border border-cyan-100/50">
                  {meeting.latestAnalysis.summary && (
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {meeting.latestAnalysis.summary}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {meeting.latestAnalysis.highlights?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText size={12} className="text-cyan-500" />
                        {meeting.latestAnalysis.highlights.length} highlights
                      </span>
                    )}
                    {meeting.latestAnalysis.todos?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <ListTodo size={12} className="text-purple-500" />
                        {meeting.latestAnalysis.todos.length} tasks
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100 flex items-center gap-2 text-sm text-gray-400">
                  <AlertCircle size={14} />
                  Chưa có phân tích AI
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(meeting.started_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(meeting.started_at)}
                </span>
                {meeting.participants?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {meeting.participants.length}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
