import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMeetingsWithAnalyses, meetingsApi } from '../services/meetings'
import {
  History as HistoryIcon,
  Calendar,
  Users,
  Clock,
  Brain,
  ChevronRight,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  Video,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  ListTodo
} from 'lucide-react'

export default function History() {
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // '', 'active', 'ended'
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [stats, setStats] = useState({ total: 0, active: 0, ended: 0 })

  // Fetch meetings với analyses
  const fetchMeetings = useCallback(async () => {
    try {
      setError('')
      const data = await getMeetingsWithAnalyses({
        limit: 100,
        offset: 0,
        status: statusFilter || undefined
      })
      setMeetings(data.meetings || [])

      // Calculate stats
      const allMeetings = data.meetings || []
      setStats({
        total: allMeetings.length,
        active: allMeetings.filter(m => m.status === 'active').length,
        ended: allMeetings.filter(m => m.status === 'ended').length
      })
    } catch (err) {
      console.error('Error fetching meetings:', err)
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

  // Navigate to meeting detail
  const handleMeetingClick = (meeting) => {
    navigate(`/home?id=${meeting.meet_id}`)
  }

  // Filter meetings by search query
  const filteredMeetings = meetings.filter(m => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Đang diễn ra
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <CheckCircle size={12} />
        Đã kết thúc
      </span>
    )
  }

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'google_meet':
        return <Video size={16} className="text-green-600" />
      case 'teams':
        return <Video size={16} className="text-blue-600" />
      case 'zoom':
        return <Video size={16} className="text-indigo-600" />
      default:
        return <Video size={16} className="text-gray-600" />
    }
  }

  return (
    <div className="p-6 py-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-semibold flex items-center gap-2 text-cyan-900">
            <HistoryIcon size={24} />
            History
          </div>
          <div className="text-sm text-cyan-800/80">
            Xem lại và quản lý các cuộc họp đã được ghi nhận
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-cyan-100">Tổng cuộc họp</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar size={24} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-sm text-green-100">Đang diễn ra</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.ended}</div>
              <div className="text-sm text-purple-100">Đã kết thúc</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc họp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-cyan-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-cyan-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-cyan-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            <option value="">Tất cả trạng thái</option>
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
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-600">
          <Loader2 size={40} className="animate-spin mb-4" />
          <span>Đang tải danh sách cuộc họp...</span>
        </div>
      ) : filteredMeetings.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <HistoryIcon size={64} className="mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">Chưa có cuộc họp nào</h3>
          <p className="text-sm text-gray-400">
            {searchQuery
              ? 'Không tìm thấy cuộc họp phù hợp với tìm kiếm của bạn'
              : 'Bắt đầu một cuộc họp mới để xem lịch sử tại đây'
            }
          </p>
        </div>
      ) : (
        /* Meetings List */
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id || meeting.meet_id}
              onClick={() => handleMeetingClick(meeting)}
              className="rounded-2xl bg-white border border-cyan-200/60 p-5 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Meeting Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getPlatformIcon(meeting.platform)}
                    <h3 className="font-semibold text-cyan-900 truncate">
                      {meeting.title || `Meeting ${meeting.meet_id}`}
                    </h3>
                    {getStatusBadge(meeting.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(meeting.started_at)}
                    </span>
                    {meeting.participants?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {meeting.participants.length} người tham gia
                      </span>
                    )}
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {meeting.meet_id}
                    </span>
                  </div>

                  {/* Analysis Preview */}
                  {meeting.latestAnalysis ? (
                    <div className="bg-cyan-50/50 rounded-xl p-3 border border-cyan-100">
                      <div className="flex items-center gap-2 text-cyan-700 text-xs font-medium mb-2">
                        <Brain size={14} />
                        Phân tích AI
                      </div>
                      {meeting.latestAnalysis.summary && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {meeting.latestAnalysis.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {meeting.latestAnalysis.highlights?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {meeting.latestAnalysis.highlights.length} điểm nổi bật
                          </span>
                        )}
                        {meeting.latestAnalysis.todos?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ListTodo size={12} />
                            {meeting.latestAnalysis.todos.length} công việc
                          </span>
                        )}
                        {meeting.latestAnalysis.model && (
                          <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">
                            {meeting.latestAnalysis.model}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <AlertCircle size={14} />
                      Chưa có phân tích
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(meeting.meet_id, e)}
                    disabled={deletingId === meeting.meet_id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Xóa cuộc họp"
                  >
                    {deletingId === meeting.meet_id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-cyan-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
