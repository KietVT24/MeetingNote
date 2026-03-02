import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import UploadPanel from '../components/UploadPanel'
import LiveMeetingPanel from '../components/LiveMeetingPanel'
import ResultPanel from '../components/ResultPanel'
import ActiveParticipantsDashboard from '../components/ActiveParticipantsDashboard'
import { ArrowLeft, Video, Mic } from 'lucide-react'
import AnalyzeEmptyState from '../components/AnalyzeEmptyState'
import TranscriptLiveMeeting from '../components/TranscriptLiveMeeting'

function Glow() {
    return <div className="absolute inset-0 -z-10 blur-3xl opacity-40 pointer-events-none">
        <div className="absolute top-10 left-20 w-72 h-72 rounded-full gradient-background-orange" />
        <div className="absolute bottom-[35rem] right-[20rem] w-56 h-56 rounded-full gradient-background-purple" />
        <div className="absolute bottom-[45.5rem] right-[45rem] w-56 h-56 rounded-full gradient-background-green" />
        <div className="absolute bottom-30 right-10 w-64 h-64 rounded-full gradient-background-1" />
    </div>
}

export default function NewMeeting() {
    const navigate = useNavigate()
    const [currentId, setCurrentId] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [params, setParams] = useSearchParams()

    useEffect(() => {
        const pid = params.get('id')
        if (pid) setCurrentId(pid)
    }, [params])

    const [tab, setTab] = useState('live')

    return (
        <div className="p-6 relative">
            <Glow />

            {/* Header với nút quay lại */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/meetings')}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <div className="text-2xl font-semibold flex items-center gap-2">
                        <span className="text-cyan-900">Tạo cuộc họp mới</span>
                    </div>
                    <div className="text-sm text-cyan-800/80">
                        Nhập mã Google Meet để bot tham gia và ghi lại nội dung cuộc họp
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid xl:grid-cols-2 gap-6">
                {/* Left Panel - Input */}
                <div className="space-y-4">
                    <div className="rounded-2xl shadow-lg bg-white p-5 border border-gray-100">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center shadow-lg">
                                <Video size={24} />
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-cyan-900">Kết nối cuộc họp</div>
                                <div className="text-sm text-gray-500">Chọn cách bạn muốn ghi lại cuộc họp</div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-2 mb-5 border-b border-gray-100 pb-3">
                            <button
                                onClick={() => setTab('live')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === 'live'
                                        ? 'bg-cyan-100 text-cyan-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Video size={16} />
                                Bot tham gia họp
                            </button>

                            <button
                                onClick={() => setTab('livetranscript')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === 'livetranscript'
                                        ? 'bg-cyan-100 text-cyan-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Mic size={16} />
                                Live Transcript
                            </button>
                        </div>

                        {/* Panel Content - Giữ nguyên logic */}
                        {tab === 'live' ? (
                            <LiveMeetingPanel
                                onAnalyzed={(id) => {
                                    setCurrentId(id)
                                    setParams({ id })
                                    setTab('livetranscript')
                                    setRefreshKey(k => k + 1)
                                }}
                            />
                        ) : tab === 'livetranscript' ? (
                            <TranscriptLiveMeeting
                                onAnalyzed={(id) => {
                                    setCurrentId(id)
                                    setParams({ id })
                                    setRefreshKey(k => k + 1)
                                }}
                            />
                        ) : (
                            <UploadPanel
                                onAnalyzed={(id) => {
                                    setCurrentId(id)
                                    setParams({ id })
                                    setRefreshKey(k => k + 1)
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Right Panel - Result */}
                <div className="min-h-[400px]">
                    <div className={`rounded-2xl shadow-lg bg-white border border-gray-100 p-6 ${currentId ? '' : 'h-full flex items-center justify-center'}`}>
                        {currentId ? (
                            <ResultPanel id={currentId} refreshKey={refreshKey} />
                        ) : (
                            <AnalyzeEmptyState />
                        )}
                    </div>
                </div>
            </div>

            {/* Active Participants Dashboard */}
            {currentId && (
                <div className="mt-6">
                    <ActiveParticipantsDashboard id={currentId} />
                </div>
            )}
        </div>
    )
}
