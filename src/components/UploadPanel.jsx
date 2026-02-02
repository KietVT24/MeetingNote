
import { useState, useRef, useEffect } from 'react'
import { transcripts } from '../services/transcripts'
import { Upload, FileText } from 'lucide-react'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function UploadPanel({ onAnalyzed }){
  const [text, setText] = useState('')
  const [output, setOutput] = useState('English')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [backendAIUrl, setBackendAIUrl] = useState(import.meta.env.VITE_BACKEND_AI_URL || 'http://localhost:8000')
  const [maxHighlights, setMaxHighlights] = useState(6)
  const [maxTodos, setMaxTodos] = useState(8)
  const fileInputRef = useRef(null)

  // Function to fetch backend URL from API
  const fetchBackendUrl = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/urls/list`);
      if (!response.ok) {
        throw new Error(`Failed to fetch URLs: ${response.status}`);
      }
      const data = await response.json();
      // Expecting shape: { healthyUrls: string[] }
      const urls = Array.isArray(data?.healthyUrls) ? data.healthyUrls : Array.isArray(data) ? data : []
      if (urls.length > 0 && typeof urls[0] === 'string') {
        setBackendAIUrl(urls[0])
        console.log('Backend URL updated:', urls[0])
      } else {
        console.warn('No healthyUrls returned, keeping default backendAIUrl')
      }
    } catch (error) {
      console.error('Error fetching backend URL:', error);
      // Keep using the default URL if API fails
    }
  };

  // Fetch backend URL on component mount
  useEffect(() => {
    fetchBackendUrl();
  }, []);



  
  async function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    if (!backendAIUrl) {
      alert('Đang lấy địa chỉ backend. Vui lòng thử lại sau vài giây.');
      return
    }

    setUploadedFile(file)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('lang', 'vi') // Vietnamese language
      
      console.log("📤 Sending transcription request...")
      
      const response = await fetch(`${backendAIUrl}/transcribe`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning'
        },
        mode: 'cors',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Transcription result:")
      console.log(`🧾 Filename: ${result.filename}`)
      console.log(`🕒 Duration: ${result.duration} seconds`)
      console.log("📖 Transcript:\n", result.transcript)
      
      setText(result.transcript || 'No transcript available')
    } catch (error) {
      console.error("❌ Error:", error)
      alert(`Upload failed: ${error.message}. Please try again.`)
    } finally {
      setUploading(false)
    }
  }

  // Function to estimate token count (rough approximation)
  const estimateTokens = (text) => {
    // Rough estimation: 1 token ≈ 4 characters for English, 3 characters for Vietnamese
    return Math.ceil(text.length / (output === 'Vietnamese' ? 3 : 4))
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

  async function handleAnalyze(){
    setLoading(true)
    
    try {
      // Check if text is too long and chunk if necessary
      const textChunks = chunkText(text)
      console.log(`📤 Sending ${textChunks.length} chunk(s) to analyze API...`)
      
      let allAnalysisResults = []
      
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i]
        console.log(`Processing chunk ${i + 1}/${textChunks.length} (${estimateTokens(chunk)} tokens)`)
        
        const response = await fetch(`${backendUrl}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: chunk,
            locale: output === 'Vietnamese' ? 'vi' : 'en',
            maxHighlights: Math.max(0, Math.floor(maxHighlights / textChunks.length)),
            maxTodos: Math.max(0, Math.floor(maxTodos / textChunks.length))
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = `Analyze failed: ${response.status}`
          
          // Handle specific error cases
          if (response.status === 429) {
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

        const analysisResult = await response.json()
        console.log("✅ Analysis result:", analysisResult)
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
        summary: allAnalysisResults.map(r => r.summary || '').join('\n\n')
      }
      
      console.log("✅ Analysis result:", mergedResult)
      
      // Tạo transcript record với kết quả từ API
      const created = await transcripts.createFromText(text, { 
        outputLang: output,
        analysisResult: mergedResult
      })
      
      setLoading(false)
      onAnalyzed(created.id)
    } catch (error) {
      console.error("❌ Analyze error:", error)
      alert(`Phân tích thất bại: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <textarea className="w-full h-56 rounded-2xl border p-4 bg-cyan-50/30" placeholder="Paste your transcript here..." value={text} onChange={e=>setText(e.target.value)} />
      <div className="text-center text-sm text-cyan-800/60">OR</div>
      <div 
        className="rounded-2xl border-dashed border-2 border-cyan-200 p-6 text-center text-sm text-cyan-800/80 cursor-pointer hover:border-cyan-300 hover:bg-cyan-50/20 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,.mp3,.wav,.m4a,.mp4,.avi,.mov"
          onChange={handleFileUpload}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading and transcribing...</span>
          </div>
        ) : uploadedFile ? (
          <div className="flex items-center justify-center gap-2">
            <FileText size={16} className="text-green-600" />
            <span className="text-green-600 font-medium">{uploadedFile.name}</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Upload size={16} />
              <span className="font-medium">Upload File</span>
            </div>
            <div>
              <span className="mr-3">Audio: MP3, WAV, M4A</span>
              <span className="mr-3">Video: MP4, AVI, MOV</span>
              <span>Docs: PDF, DOC, XLSX, JSON</span>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border p-4 space-y-3">
        <div className="text-sm font-medium">Select Output Language</div>
        <label className="mr-6"><input type="radio" name="out" checked={output==='English'} onChange={()=>setOutput('English')}/> English</label>
        <label><input type="radio" name="out" checked={output==='Vietnamese'} onChange={()=>setOutput('Vietnamese')}/> Vietnamese</label>
        
      </div>
      <div className="sticky bottom-0 bg-white py-2">
        <button disabled={!text||loading} onClick={handleAnalyze} className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-white py-3 shadow-soft disabled:opacity-50">
          {loading? 'Processing…' : 'Analyze'}
        </button>
      </div>
    </div>
  )
}
