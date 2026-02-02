import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { transcriptsApi, analysesApi, meetingsApi } from '../../services/meetings'
import {
    ArrowLeft,
    Video,
    Calendar,
    Brain,
    FileText,
    ListTodo,
    CheckCircle,
    AlertCircle,
    Loader2,
    MessageSquare,
    Star,
    RefreshCw,
    Pencil,
    Check,
    X,
    Sparkles
} from 'lucide-react'

export default function TranscriptDetail() {
    const { meetId } = useParams()
    const navigate = useNavigate()

    const [meeting, setMeeting] = useState(null)
    const [transcript, setTranscript] = useState(null)
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('transcript')
    const [refreshing, setRefreshing] = useState(false)

    // Edit title states
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [savingTitle, setSavingTitle] = useState(false)

    // Analyze states
    const [analyzing, setAnalyzing] = useState(false)
    const [analyzeProgress, setAnalyzeProgress] = useState('')

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

    const fetchData = async () => {
        if (!meetId) return

        setLoading(true)
        setError('')

        try {
            const meetingData = await meetingsApi.get(meetId)
            setMeeting(meetingData?.data || meetingData)

            const transcriptData = await transcriptsApi.getGoogleMeet(meetId)
            setTranscript(transcriptData)

            const analysisData = await analysesApi.getLatest(meetId)
            setAnalysis(analysisData)
        } catch (err) {
            setError(err.message || 'Không thể tải dữ liệu')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [meetId])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchData()
    }

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return ''
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleEditTitle = () => {
        setEditTitle(meeting?.title || `Meeting ${meetId}`)
        setIsEditingTitle(true)
    }

    const handleSaveTitle = async () => {
        if (!editTitle.trim()) return
        setSavingTitle(true)
        try {
            await meetingsApi.updateTitle(meetId, editTitle.trim())
            setMeeting(prev => ({ ...prev, title: editTitle.trim() }))
            setIsEditingTitle(false)
        } catch (err) {
            setError(`Không thể cập nhật tiêu đề: ${err.message}`)
        } finally {
            setSavingTitle(false)
        }
    }

    const handleCancelEdit = () => {
        setIsEditingTitle(false)
        setEditTitle('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSaveTitle()
        else if (e.key === 'Escape') handleCancelEdit()
    }

    const handleAnalyze = async () => {
        if (!transcript?.segments?.length) {
            setError('Không có transcript để phân tích')
            return
        }

        setAnalyzing(true)
        setAnalyzeProgress('Đang chuẩn bị dữ liệu...')
        setError('')

        try {
            const segments = transcript.segments
            const combinedText = segments.map(s => `${s.speaker}: ${s.text}`).join('\n')
            const locale = 'vi'

            const estimateTokens = (text) => Math.ceil(text.length / 3)

            const chunkText = (text, maxTokens = 25000) => {
                if (estimateTokens(text) <= maxTokens) return [text]
                const chunks = []
                const sentences = text.split(/[.!?]\s+/)
                let currentChunk = ''
                for (const sentence of sentences) {
                    const testChunk = currentChunk + (currentChunk ? '. ' : '') + sentence
                    if (estimateTokens(testChunk) > maxTokens && currentChunk) {
                        chunks.push(currentChunk)
                        currentChunk = sentence
                    } else {
                        currentChunk = testChunk
                    }
                }
                if (currentChunk) chunks.push(currentChunk)
                return chunks
            }

            const textChunks = chunkText(combinedText)
            let allAnalysisResults = []

            for (let i = 0; i < textChunks.length; i++) {
                setAnalyzeProgress(`Đang phân tích phần ${i + 1}/${textChunks.length}...`)
                const res = await fetch(`${backendUrl}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: textChunks[i],
                        locale,
                        meetId,
                        maxHighlights: Math.max(1, Math.floor(6 / textChunks.length)),
                        maxTodos: Math.max(1, Math.floor(8 / textChunks.length))
                    })
                })
                if (!res.ok) throw new Error(res.status === 429 ? 'Đã đạt giới hạn token. Vui lòng thử lại sau.' : `Analyze failed: ${res.status}`)
                allAnalysisResults.push(await res.json())
                if (i < textChunks.length - 1) {
                    setAnalyzeProgress('Chờ giới hạn API...')
                    await new Promise(r => setTimeout(r, 2000))
                }
            }

            setAnalyzeProgress('Đang tổng hợp kết quả...')
            setAnalysis({
                highlights: allAnalysisResults.flatMap(r => r.highlights || []),
                todos: allAnalysisResults.flatMap(r => r.todos || []),
                summary: allAnalysisResults.map(r => r.summary || '').join('\n\n'),
                model: allAnalysisResults[0]?.model,
                tokens_used: allAnalysisResults.reduce((s, r) => s + (r.tokens_used || 0), 0),
                processing_time_ms: allAnalysisResults.reduce((s, r) => s + (r.processing_time_ms || 0), 0),
                created_at: new Date().toISOString()
            })
        } catch (err) {
            setError(`Phân tích thất bại: ${err.message}`)
        } finally {
            setAnalyzing(false)
            setAnalyzeProgress('')
        }
    }

    if (loading) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-cyan-600">
                <Loader2 size={48} className="animate-spin mb-4" />
                <span className="text-lg">Đang tải dữ liệu...</span>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/meetings')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>

                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                            <Video size={24} className="text-cyan-600" />
                        </div>
                        <div className="flex-1">
                            {isEditingTitle ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        className="text-xl font-semibold text-cyan-900 px-3 py-1 border-2 border-cyan-300 rounded-lg focus:outline-none focus:border-cyan-500 min-w-[300px]"
                                    />
                                    <button onClick={handleSaveTitle} disabled={savingTitle || !editTitle.trim()} className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50">
                                        {savingTitle ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <h1 className="text-xl font-semibold text-cyan-900">{meeting?.title || `Meeting ${meetId}`}</h1>
                                    <button onClick={handleEditTitle} className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 opacity-0 group-hover:opacity-100">
                                        <Pencil size={16} />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="font-mono">{meetId}</span>
                                {meeting?.started_at && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(meeting.started_at)}</span>
                                    </>
                                )}
                                {meeting?.status && (
                                    <>
                                        <span>•</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meeting.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {meeting.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-100 text-cyan-700 hover:bg-cyan-200 disabled:opacity-50">
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('transcript')} className={`py-3 px-6 text-sm font-medium flex items-center gap-2 ${activeTab === 'transcript' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-700'}`}>
                    <MessageSquare size={18} />
                    Transcript
                    {transcript?.segments?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs">{transcript.segments.length}</span>}
                </button>
                <button onClick={() => setActiveTab('analysis')} className={`py-3 px-6 text-sm font-medium flex items-center gap-2 ${activeTab === 'analysis' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Brain size={18} />
                    Phân tích AI
                    {analysis && <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">✓</span>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'transcript' ? (
                <div>
                    {transcript?.segments?.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <MessageSquare size={18} className="text-cyan-600" />
                                    Nội dung hội thoại
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {transcript.segments.map((segment, idx) => (
                                    <div key={segment.id || idx} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                                                {(segment.speaker || 'U')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-cyan-900">{segment.speaker || 'Unknown'}</span>
                                                    {(segment.start !== null || segment.end !== null) && (
                                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                            {formatTime(segment.start)} → {formatTime(segment.end)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{segment.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
                            <MessageSquare size={64} className="mb-4 opacity-30" />
                            <h3 className="text-lg font-medium mb-2">Chưa có transcript</h3>
                            <p className="text-sm text-gray-400">Transcript sẽ hiển thị khi bot ghi nhận được hội thoại</p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {/* Analyze Button Bar */}
                    <div className="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Sparkles size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-purple-900">Phân tích AI</h3>
                                <p className="text-sm text-purple-700/70">
                                    {transcript?.segments?.length > 0 ? `${transcript.segments.length} đoạn hội thoại sẵn sàng` : 'Cần có transcript để phân tích'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || !transcript?.segments?.length}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {analyzing ? (
                                <><Loader2 size={18} className="animate-spin" />{analyzeProgress || 'Đang phân tích...'}</>
                            ) : (
                                <><Sparkles size={18} />{analysis ? 'Phân tích lại' : 'Bắt đầu phân tích'}</>
                            )}
                        </button>
                    </div>

                    {analysis ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Summary */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
                                    <h3 className="font-semibold text-cyan-900 flex items-center gap-2">
                                        <FileText size={18} className="text-cyan-600" />
                                        Tóm tắt cuộc họp
                                    </h3>
                                </div>
                                <div className="p-5">
                                    <p className="text-gray-700 leading-relaxed text-lg">{analysis.summary || 'Không có tóm tắt'}</p>
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                                    <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                                        <Star size={18} className="text-amber-600" />
                                        Điểm nổi bật
                                        {analysis.highlights?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs ml-auto">{analysis.highlights.length}</span>}
                                    </h3>
                                </div>
                                <div className="p-5">
                                    {analysis.highlights?.length > 0 ? (
                                        <ul className="space-y-3">
                                            {analysis.highlights.map((h, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-medium text-amber-700">{i + 1}</span>
                                                    </div>
                                                    <span className="leading-relaxed">{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-gray-400 text-center py-8">Không có điểm nổi bật</p>}
                                </div>
                            </div>

                            {/* Todos */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                                    <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                                        <ListTodo size={18} className="text-purple-600" />
                                        Công việc cần làm
                                        {analysis.todos?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs ml-auto">{analysis.todos.length}</span>}
                                    </h3>
                                </div>
                                <div className="p-5">
                                    {analysis.todos?.length > 0 ? (
                                        <div className="space-y-4">
                                            {analysis.todos.map((todo, i) => (
                                                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                    <div className="flex items-start gap-3">
                                                        <CheckCircle size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-800 mb-1">{todo.task || todo.text}</div>
                                                            {todo.rationale && <div className="text-sm text-gray-500 mb-2">{todo.rationale}</div>}
                                                            <div className="flex flex-wrap gap-2">
                                                                {todo.priority && <span className={`px-2 py-1 rounded-lg text-xs font-medium ${todo.priority === 'high' ? 'bg-red-100 text-red-700' : todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>⚡ {todo.priority}</span>}
                                                                {todo.due && <span className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700">📅 {todo.due}</span>}
                                                                {todo.owner_hint && <span className="px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700">👤 {todo.owner_hint}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-gray-400 text-center py-8">Không có công việc</p>}
                                </div>
                            </div>

                            {/* Meta Info */}

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
                            <Brain size={64} className="mb-4 opacity-30" />
                            <h3 className="text-lg font-medium mb-2">Chưa có phân tích</h3>
                            <p className="text-sm text-gray-400">Click nút "Bắt đầu phân tích" ở trên để AI phân tích transcript</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
