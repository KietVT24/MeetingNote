import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { sharedMeetingsApi } from '../../services/meetings'
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import {
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
    Users,
    Globe,
    Download
} from 'lucide-react'

// Initialize pdfMake with fonts
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs
}

export default function SharedMeeting() {
    const { shareToken } = useParams()
    const [meeting, setMeeting] = useState(null)
    const [transcript, setTranscript] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('transcript')

    useEffect(() => {
        const fetchSharedMeeting = async () => {
            if (!shareToken) return

            setLoading(true)
            setError('')

            try {
                const meetingData = await sharedMeetingsApi.get(shareToken)
                setMeeting(meetingData.data)

                const transcriptData = await sharedMeetingsApi.getTranscript(shareToken)
                setTranscript(transcriptData)
            } catch (err) {
                setError('Người dùng không chia sẻ nội dung này.')
            } finally {
                setLoading(false)
            }
        }

        fetchSharedMeeting()
    }, [shareToken])

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

    const downloadTranscriptPDF = () => {
        if (!transcript?.segments?.length) return

        const content = []

        // Title
        content.push({
            text: meeting?.title || `Meeting ${meeting?.meet_id}`,
            style: 'header',
            margin: [0, 0, 0, 10]
        })

        // Meeting info
        const infoLines = [
            `Meeting ID: ${meeting?.meet_id}`,
            meeting?.started_at ? `Date: ${formatDate(meeting.started_at)}` : null,
            meeting?.participants?.length > 0 ? `Participants: ${meeting.participants.join(', ')}` : null
        ].filter(Boolean)

        content.push({
            text: infoLines.join('\n'),
            style: 'info',
            margin: [0, 0, 0, 20]
        })

        // Transcript header
        content.push({
            text: 'Transcript',
            style: 'subheader',
            margin: [0, 0, 0, 10]
        })

        // Transcript segments
        transcript.segments.forEach((segment, idx) => {
            const speakerText = segment.speaker || 'Unknown'
            const timeText = (segment.start !== null || segment.end !== null) 
                ? ` [${formatTime(segment.start)} - ${formatTime(segment.end)}]`
                : ''

            content.push({
                text: [
                    { text: speakerText, bold: true, color: '#0064C8' },
                    { text: timeText, color: '#999999' }
                ],
                margin: [0, idx === 0 ? 0 : 10, 0, 3]
            })

            content.push({
                text: segment.text,
                margin: [0, 0, 0, 5]
            })
        })

        const docDefinition = {
            content: content,
            styles: {
                header: {
                    fontSize: 20,
                    bold: true,
                    color: '#000000'
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    color: '#000000'
                },
                info: {
                    fontSize: 10,
                    color: '#666666'
                }
            },
            defaultStyle: {
                fontSize: 10,
                font: 'Roboto'
            },
            pageMargins: [40, 40, 40, 60],
            footer: function(currentPage, pageCount) {
                return {
                    text: `Page ${currentPage} of ${pageCount}`,
                    alignment: 'center',
                    fontSize: 8,
                    color: '#999999',
                    margin: [0, 20, 0, 0]
                }
            }
        }

        pdfMake.createPdf(docDefinition).download(`transcript-${meeting?.meet_id}.pdf`)
    }

    const downloadAnalysisPDF = () => {
        const analysis = meeting?.analysis
        if (!analysis) return

        const content = []

        // Title
        content.push({
            text: meeting?.title || `Meeting ${meeting?.meet_id}`,
            style: 'header',
            margin: [0, 0, 0, 10]
        })

        // Meeting info
        const infoLines = [
            `Meeting ID: ${meeting?.meet_id}`,
            meeting?.started_at ? `Date: ${formatDate(meeting.started_at)}` : null
        ].filter(Boolean)

        content.push({
            text: infoLines.join('\n'),
            style: 'info',
            margin: [0, 0, 0, 20]
        })

        // Summary
        content.push({
            text: 'Summary',
            style: 'subheader',
            color: '#0096C8',
            margin: [0, 0, 0, 8]
        })

        content.push({
            text: analysis.summary || 'No summary',
            margin: [0, 0, 0, 15]
        })

        // Highlights
        if (analysis.highlights?.length > 0) {
            content.push({
                text: 'Highlights',
                style: 'subheader',
                color: '#FF9600',
                margin: [0, 10, 0, 8]
            })

            const highlightsList = analysis.highlights.map((h, idx) => ({
                text: `${idx + 1}. ${h}`,
                margin: [0, 0, 0, 5]
            }))

            content.push(...highlightsList)
        }

        // Todos
        if (analysis.todos?.length > 0) {
            content.push({
                text: 'Action Items',
                style: 'subheader',
                color: '#9600C8',
                margin: [0, 15, 0, 8]
            })

            analysis.todos.forEach((todo, idx) => {
                // Task
                content.push({
                    text: `${idx + 1}. ${todo.task || todo.text}`,
                    bold: true,
                    margin: [0, idx === 0 ? 0 : 10, 0, 3]
                })

                // Metadata
                const metadata = []
                if (todo.priority) metadata.push(`Priority: ${todo.priority}`)
                if (todo.due) metadata.push(`Due: ${todo.due}`)
                if (todo.owner_hint) metadata.push(`Owner: ${todo.owner_hint}`)

                if (metadata.length > 0) {
                    content.push({
                        text: metadata.join(' | '),
                        fontSize: 9,
                        color: '#666666',
                        margin: [10, 0, 0, 0]
                    })
                }
            })
        }

        const docDefinition = {
            content: content,
            styles: {
                header: {
                    fontSize: 20,
                    bold: true,
                    color: '#000000'
                },
                subheader: {
                    fontSize: 14,
                    bold: true
                },
                info: {
                    fontSize: 10,
                    color: '#666666'
                }
            },
            defaultStyle: {
                fontSize: 10,
                font: 'Roboto'
            },
            pageMargins: [40, 40, 40, 60],
            footer: function(currentPage, pageCount) {
                return {
                    text: `Page ${currentPage} of ${pageCount}`,
                    alignment: 'center',
                    fontSize: 8,
                    color: '#999999',
                    margin: [0, 20, 0, 0]
                }
            }
        }

        pdfMake.createPdf(docDefinition).download(`analysis-${meeting?.meet_id}.pdf`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Đang tải meeting...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải meeting</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    const analysis = meeting?.analysis

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                            <Globe size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{meeting?.title || `Meeting ${meeting?.meet_id}`}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="font-mono">{meeting?.meet_id}</span>
                                {meeting?.started_at && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(meeting.started_at)}
                                        </span>
                                    </>
                                )}
                                {meeting?.status && (
                                    <>
                                        <span>•</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            meeting.status === 'active' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {meeting.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {meeting?.participants?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <Users size={16} className="text-purple-600" />
                            <span className="font-medium">Người tham gia:</span>
                            <span>{meeting.participants.join(', ')}</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button 
                            onClick={() => setActiveTab('transcript')} 
                            className={`py-4 px-6 text-sm font-medium flex items-center gap-2 transition-colors ${
                                activeTab === 'transcript' 
                                    ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <MessageSquare size={18} />
                            Transcript
                            {transcript?.segments?.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs">
                                    {transcript.segments.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('analysis')} 
                            className={`py-4 px-6 text-sm font-medium flex items-center gap-2 transition-colors ${
                                activeTab === 'analysis' 
                                    ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Brain size={18} />
                            Phân tích AI
                            {analysis && <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">✓</span>}
                        </button>

                        {/* Download buttons */}
                        <div className="ml-auto flex items-center gap-2 px-4">
                            {activeTab === 'transcript' && transcript?.segments?.length > 0 && (
                                <button 
                                    onClick={downloadTranscriptPDF}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
                                >
                                    <Download size={16} />
                                    Tải PDF
                                </button>
                            )}
                            {activeTab === 'analysis' && analysis && (
                                <button 
                                    onClick={downloadAnalysisPDF}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                                >
                                    <Download size={16} />
                                    Tải PDF
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'transcript' ? (
                            <div>
                                {transcript?.segments?.length > 0 ? (
                                    <div className="space-y-4">
                                        {transcript.segments.map((segment, idx) => (
                                            <div key={segment.id || idx} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                                                        {(segment.speaker || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium text-cyan-900">{segment.speaker || 'Unknown'}</span>
                                                            {(segment.start !== null || segment.end !== null) && (
                                                                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded">
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
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                        <MessageSquare size={64} className="mb-4 opacity-30" />
                                        <h3 className="text-lg font-medium mb-2">Chưa có transcript</h3>
                                        <p className="text-sm text-gray-400">Transcript sẽ hiển thị khi có dữ liệu</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {analysis ? (
                                    <div className="space-y-6">
                                        {/* Summary */}
                                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
                                            <h3 className="font-semibold text-cyan-900 flex items-center gap-2 mb-4">
                                                <FileText size={20} className="text-cyan-600" />
                                                Tóm tắt cuộc họp
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed text-lg">{analysis.summary || 'Không có tóm tắt'}</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Highlights */}
                                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                                                <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-4">
                                                    <Star size={20} className="text-amber-600" />
                                                    Điểm nổi bật
                                                    {analysis.highlights?.length > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs ml-auto">
                                                            {analysis.highlights.length}
                                                        </span>
                                                    )}
                                                </h3>
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
                                                ) : (
                                                    <p className="text-gray-400 text-center py-8">Không có điểm nổi bật</p>
                                                )}
                                            </div>

                                            {/* Todos */}
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                                                <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-4">
                                                    <ListTodo size={20} className="text-purple-600" />
                                                    Công việc cần làm
                                                    {analysis.todos?.length > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs ml-auto">
                                                            {analysis.todos.length}
                                                        </span>
                                                    )}
                                                </h3>
                                                {analysis.todos?.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {analysis.todos.map((todo, i) => (
                                                            <div key={i} className="bg-white rounded-xl p-4 border border-purple-100">
                                                                <div className="flex items-start gap-3">
                                                                    <CheckCircle size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-800 mb-1">{todo.task || todo.text}</div>
                                                                        {todo.rationale && (
                                                                            <div className="text-sm text-gray-500 mb-2">{todo.rationale}</div>
                                                                        )}
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {todo.priority && (
                                                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                                                    todo.priority === 'high' 
                                                                                        ? 'bg-red-100 text-red-700' 
                                                                                        : todo.priority === 'medium' 
                                                                                        ? 'bg-yellow-100 text-yellow-700' 
                                                                                        : 'bg-gray-100 text-gray-600'
                                                                                }`}>
                                                                                    ⚡ {todo.priority}
                                                                                </span>
                                                                            )}
                                                                            {todo.due && (
                                                                                <span className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700">
                                                                                    📅 {todo.due}
                                                                                </span>
                                                                            )}
                                                                            {todo.owner_hint && (
                                                                                <span className="px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700">
                                                                                    👤 {todo.owner_hint}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-400 text-center py-8">Không có công việc</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                        <Brain size={64} className="mb-4 opacity-30" />
                                        <h3 className="text-lg font-medium mb-2">Chưa có phân tích</h3>
                                        <p className="text-sm text-gray-400">Meeting này chưa được phân tích bởi AI</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Meeting được chia sẻ công khai • Xink Meeting Analysis</p>
                </div>
            </div>
        </div>
    )
}
