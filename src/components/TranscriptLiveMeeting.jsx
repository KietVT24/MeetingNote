import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { transcripts } from '../services/transcripts'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'
import { Download } from 'lucide-react'
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
export default function TranscriptLiveMeeting({ onAnalyzed }){
  const [params] = useSearchParams()
  const id = params.get('id')
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [meetCode, setMeetCode] = useState('')
  const [segments, setSegments] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const pollerRef = useRef(null)

  async function loadTranscriptMeta(){
    if(!id) return
    const it = await transcripts.get(id)
    setItem(it || null)
    setMeetCode(it?.meetCode || '')
  }

  async function fetchTranscript(code){
    if(!code) return
    try{
      const res = await fetch(`${backendUrl}/api/transcripts/google_meet/${code}`)
      if(!res.ok) throw new Error(await res.text())
      const data = await res.json()
      let segs = []
      if (Array.isArray(data?.segments)) segs = data.segments
      else if (Array.isArray(data)) segs = data
      else if (Array.isArray(data?.results)) segs = data.results
      // Normalize and attach displayTime (stable for existing IDs)
      const existingById = Object.fromEntries((segments||[]).map(x=>[x.id, x]))
      segs = segs
        .filter(s => s && (s.text || s.transcript || s.caption))
        .map((s, idx) => {
          const id = s.id ?? `${s.start_time ?? idx}-${idx}`
          const prior = existingById[id]
          return {
            id,
            speaker: s.speaker ?? s.speaker_label ?? 'Người nói',
            text: s.text ?? s.transcript ?? s.caption ?? '',
            start: s.start_time ?? s.start ?? null,
            end: s.end_time ?? s.end ?? null,
            displayTime: prior?.displayTime || new Date().toLocaleTimeString()
          }
        })
      // Sort newest first by time markers if present, else by order
      segs.sort((a,b)=>{
        const at = (a.end ?? a.start ?? 0); const bt = (b.end ?? b.start ?? 0)
        return bt - at
      })
      setSegments(segs)
      setLastUpdated(new Date())
      if(id) {
        await transcripts.updateSegments(id, segs)
        // After API success, read back from localStorage as source of truth
        const it = await transcripts.get(id)
        if(Array.isArray(it?.segments)) setSegments(it.segments)
      }
      setError('')
    }catch(e){
      setError(`Lỗi lấy transcript: ${e.message||e}`)
      // Fallback: load segments from localStorage when API is not available
      if(id){
        const it = await transcripts.get(id)
        if(Array.isArray(it?.segments)) setSegments(it.segments)
      }
    }
  }

  useEffect(()=>{
    loadTranscriptMeta()
  }, [id])

  useEffect(()=>{
    if(!meetCode) return
    fetchTranscript(meetCode)
    if(pollerRef.current) clearInterval(pollerRef.current)
    pollerRef.current = setInterval(()=>fetchTranscript(meetCode), 2000)
    return ()=>{ if(pollerRef.current) clearInterval(pollerRef.current) }
  }, [meetCode])

  // Enforce 60-minute usage limit for Live Transcript Meeting
  useEffect(()=>{
    if(!id) return
    const KEY = `live-usage-start-${id}`
    let start = localStorage.getItem(KEY)
    if(!start){
      start = Date.now().toString()
      localStorage.setItem(KEY, start)
    }
    const check = () => {
      const elapsedMs = Date.now() - Number(localStorage.getItem(KEY) || start)
      const limitMs = 60 * 1000 *60 * 10
      if(elapsedMs >= limitMs){
        navigate('/price', { replace: true })
      }
    }
    const t = setInterval(check, 15000) // check every 15s
    check()
    return ()=> clearInterval(t)
  }, [id, navigate])

  const hasSegments = useMemo(()=> Array.isArray(segments) && segments.length>0, [segments])

  // Function to export transcript to DOCX
  const exportToDocx = async () => {
    if (!hasSegments) return

    try {
      // Create document title
      const meetingTitle = `Live Meeting Transcript - ${meetCode || 'Unknown Meeting'}`
      const exportDate = new Date().toLocaleString('vi-VN')
      
      // Create paragraphs for the document
      const docParagraphs = [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: meetingTitle,
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        
        // Export info
        new Paragraph({
          children: [
            new TextRun({
              text: `Xuất lúc: ${exportDate}`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 400 },
        }),
        
        // Meeting info
        new Paragraph({
          children: [
            new TextRun({
              text: `Meeting Code: ${meetCode}`,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `Tổng số đoạn hội thoại: ${segments.length}`,
              size: 20,
            }),
          ],
          spacing: { after: 400 },
        }),
        
        // Transcript content header
        new Paragraph({
          children: [
            new TextRun({
              text: 'Nội dung hội thoại:',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),
      ]

      // Add each segment to the document
      segments.forEach((segment, index) => {
        // Speaker and time info
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${segment.speaker}`,
                bold: true,
                size: 22,
                color: '0066CC',
              }),
              new TextRun({
                text: ` (${segment.displayTime})`,
                size: 18,
                color: '666666',
                italics: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        )
        
        // Segment text
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: segment.text,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
            indent: { left: 400 },
          })
        )
      })

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docParagraphs,
          },
        ],
      })

      // Generate and save the file
      const blob = await Packer.toBlob(doc)
      const fileName = `transcript-${meetCode || 'meeting'}-${new Date().toISOString().split('T')[0]}.docx`
      saveAs(blob, fileName)
      
    } catch (error) {
      console.error('Error exporting to DOCX:', error)
      setError(`Lỗi xuất file: ${error.message}`)
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-200/60 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium text-cyan-900">Live Meeting Transcript</h4>
          <p className="text-xs text-cyan-700/80">
            {item?.isLiveMeeting ? (lastUpdated ? `Cập nhật: ${lastUpdated.toLocaleTimeString()}` : 'Đang cập nhật...') : 'Không có dữ liệu live meeting'}
          </p>
        </div>
        {meetCode && (
          <div className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-lg text-xs font-medium">
            {meetCode}
          </div>
        )}
      </div>

      <div className="max-h-[25rem] overflow-y-auto space-y-2">
        {item?.isLiveMeeting ? (
          hasSegments ? (
            segments.map(s => (
              <div key={s.id} className="border border-cyan-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-medium text-cyan-600">{s.speaker}</div>
                  <div className="text-[11px] text-cyan-600/80">{s.displayTime}</div>
                </div>
                <div className="text-sm text-cyan-900">{s.text}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-cyan-700/80 text-sm">Chưa có câu thoại. Hãy Admit bot trong phòng.</div>
          )
        ) : (
          <div className="text-sm text-cyan-800/80">Không có dữ liệu live meeting.</div>
        )}
      </div>
      
      
      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        {/* Download DOCX Button */}
        <button
          disabled={!hasSegments}
          onClick={exportToDocx}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium shadow-soft disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-600 transition-all"
        >
          <Download size={16} />
          Tải DOCX
        </button>
        
        {/* Analyze Button */}
        <button
          disabled={!meetCode || segments.length===0 || analyzing || !id}
          onClick={async ()=>{
            setAnalyzing(true)
            setError('')
            try{
              const combinedText = segments.map(s=>`${s.speaker}: ${s.text}`).join('\n')
              const locale = (item?.outputLang === 'Vietnamese') ? 'vi' : 'en'
              
              // Function to estimate token count
              const estimateTokens = (text) => {
                return Math.ceil(text.length / (locale === 'vi' ? 3 : 4))
              }

              // Function to chunk text if it's too long
              const chunkText = (text, maxTokens = 25000) => {
                const estimatedTokens = estimateTokens(text)
                if (estimatedTokens <= maxTokens) {
                  return [text]
                }

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
                
                if (currentChunk) {
                  chunks.push(currentChunk)
                }
                
                return chunks
              }

              const textChunks = chunkText(combinedText)
              console.log(`📤 Sending ${textChunks.length} chunk(s) to analyze API...`)
              
              let allAnalysisResults = []
              
              for (let i = 0; i < textChunks.length; i++) {
                const chunk = textChunks[i]
                console.log(`Processing chunk ${i + 1}/${textChunks.length} (${estimateTokens(chunk)} tokens)`)
                
                const payload = { 
                  text: chunk, 
                  locale, 
                  maxHighlights: Math.max(1, Math.floor(6 / textChunks.length)), 
                  maxTodos: Math.max(1, Math.floor(8 / textChunks.length)) 
                }
                
                const res = await fetch(`${backendUrl}/analyze`,{ 
                  method:'POST', 
                  headers:{'Content-Type':'application/json'}, 
                  body: JSON.stringify(payload) 
                })
                
                if(!res.ok) {
                  const errorText = await res.text()
                  let errorMessage = `Analyze failed: ${res.status}`
                  
                  // Handle specific error cases
                  if (res.status === 429) {
                    try {
                      const errorData = JSON.parse(errorText)
                      if (errorData.message && errorData.message.includes('tokens per min')) {
                        errorMessage = `Lỗi giới hạn token: Văn bản quá dài. Vui lòng chia nhỏ nội dung hoặc thử lại sau ít phút.`
                      }
                    } catch (e) {
                      errorMessage = `Lỗi giới hạn token: Văn bản quá dài. Vui lòng thử lại sau ít phút.`
                    }
                  }
                  
                  throw new Error(errorMessage)
                }
                
                const analysisResult = await res.json()
                allAnalysisResults.push(analysisResult)
                
                // Add delay between chunks to avoid rate limiting
                if (i < textChunks.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 2000))
                }
              }

              // Merge all analysis results
              const mergedResult = {
                highlights: allAnalysisResults.flatMap(r => r.highlights || []),
                todos: allAnalysisResults.flatMap(r => r.todos || []),
                summary: allAnalysisResults.map(r => r.summary || '').join('\n\n'),
                // Prefer the last non-empty active_participants
                active_participants: [...allAnalysisResults].reverse().find(r => r && r.active_participants)?.active_participants || null,
              }
              
              await transcripts.applyAnalysis(id, mergedResult)
              onAnalyzed && onAnalyzed(id)
            }catch(e){
              setError(`Phân tích thất bại: ${e.message||e}`)
            }finally{
              setAnalyzing(false)
            }
          }}
          className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white py-2 px-4 text-sm font-medium shadow-soft disabled:opacity-50 hover:from-cyan-700 hover:to-cyan-600 transition-all"
        >
          {analyzing? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
    </div>
  )
}