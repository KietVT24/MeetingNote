
import { useEffect, useState } from 'react'
import UploadPanel from '../components/UploadPanel'
import LiveMeetingPanel from '../components/LiveMeetingPanel'
import ResultPanel from '../components/ResultPanel'
import ActiveParticipantsDashboard from '../components/ActiveParticipantsDashboard'
import { Brain } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
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
export default function Home() {
  const [currentId, setCurrentId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [params, setParams] = useSearchParams()
  useEffect(() => {
    const pid = params.get('id')
    if (pid) setCurrentId(pid)
  }, [params])
  const [tab, setTab] = useState('live')
  return (
    <div className="p-6 py-0 relative">

      <div className="text-2xl font-semibold mb-1 flex items-center gap-2"><span className="text-cyan-900">Home</span></div>
      <div className="text-sm text-cyan-800/80 mb-5">Transform your meetings into actionable insights with AI-powered analysis</div>
      <div className="grid xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl shadow-custom bg-white p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center"><Brain size={22} /></div>
              <div>
                <div className="text-lg font-semibold text-cyan-900">Your Input</div>
                <div className="text-sm text-cyan-800/80">Choose how you want to provide your meeting content</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-[14px]">
              {/* <button onClick={()=>setTab('upload')} className={`relative px-2 py-1 text-cyan-800 ${tab==='upload'?'font-semibold':''}`}>
                Upload Transcript
                {tab==='upload' && <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-cyan-500 rounded"></span>}
              </button> */}

              <button onClick={() => setTab('live')} className={`relative px-2 py-1 text-cyan-800 ${tab === 'live' ? 'font-semibold' : ''}`}>
                Live Meeting
                {tab === 'live' && <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-cyan-500 rounded"></span>}
              </button>

              <button onClick={() => setTab('livetranscript')} className={`relative px-2 py-1 text-cyan-800 ${tab === 'livetranscript' ? 'font-semibold' : ''}`}>
                Live Transcript Meeting
                {tab === 'livetranscript' && <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-cyan-500 rounded"></span>}
              </button>


            </div>
            {tab === 'upload' ? <UploadPanel onAnalyzed={(id) => { setCurrentId(id); setParams({ id }); setRefreshKey(k => k + 1) }} /> :
              tab === 'live' ? <LiveMeetingPanel onAnalyzed={(id) => { setCurrentId(id); setParams({ id }); setTab('livetranscript'); setRefreshKey(k => k + 1) }} /> :
                tab === 'livetranscript' ? <TranscriptLiveMeeting onAnalyzed={(id) => { setCurrentId(id); setParams({ id }); setRefreshKey(k => k + 1) }} /> :
                  <div className="text-gray-500">Recording mock UI…</div>}
          </div>
        </div>
        <div className="min-h-[400px]">
          <div className={`rounded-2xl shadow-custom bg-white flex items-center justify-center text-center p-8 ${currentId ? '' : 'h-full'}`}>
            <div>
              {currentId ? <ResultPanel id={currentId} refreshKey={refreshKey} /> : <AnalyzeEmptyState />}

            </div>
          </div>
        </div>
      </div>
      {currentId && (
        <div className="mt-6">
          <ActiveParticipantsDashboard id={currentId} />
        </div>
      )}
    </div>
  )
}
