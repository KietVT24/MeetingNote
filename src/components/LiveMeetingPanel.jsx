import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { transcripts } from '../services/transcripts'
import { meetingsApi } from '../services/meetings'
import { Video, Bot, Globe } from 'lucide-react'
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
function extractMeetCode(input) {
  if (!input) return "";
  const trimmed = input.trim();
  const codeOnly = /^([a-z]{3}-[a-z]{4}-[a-z]{3})$/i.exec(trimmed);
  if (codeOnly) return codeOnly[1].toLowerCase();
  try {
    const url = new URL(trimmed);
    const pathCode = /([a-z]{3}-[a-z]{4}-[a-z]{3})/i.exec(url.pathname);
    if (pathCode) return pathCode[1].toLowerCase();
    return "";
  } catch {
    return "";
  }
}

export default function LiveMeetingPanel({ onAnalyzed }) {
  const [meetLink, setMeetLink] = useState('')
  const [botName, setBotName] = useState('Note Pro Meeting Bot')
  const [language, setLanguage] = useState('Vietnamese')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [meetCode, setMeetCode] = useState('')
  const [segments, setSegments] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [currentTranscriptId, setCurrentTranscriptId] = useState(null)

  const codeParsed = useMemo(() => extractMeetCode(meetLink), [meetLink])
  const pollerRef = useRef(null)

  const callCreateBot = useCallback(async (code) => {
    setJoining(true);
    setError("");
    try {
      const res = await fetch(`${backendUrl}/api/bots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetUrl: `https://meet.google.com/${code}`,
          native_meeting_id: code,
          platform: "google_meet",
          language: language === 'Vietnamese' ? 'vi' : 'en',
          botName: botName,
          bot_name: botName // Alias cho Vexa fallback
        })
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
    } catch (e) {
      setError(`${e.message.detail || e.detail || e}`);
    } finally {
      setJoining(false);
    }
  }, [language, botName]);

  const fetchTranscript = useCallback(async (code) => {
    try {
      const res = await fetch(`${backendUrl}/api/transcripts/google_meet/${code}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      let segs = [];
      if (Array.isArray(data?.segments)) segs = data.segments;
      else if (Array.isArray(data)) segs = data;
      else if (Array.isArray(data?.results)) segs = data.results;
      segs = segs
        .filter((s) => s && (s.text || s.transcript || s.caption))
        .map((s, idx) => ({
          id: s.id ?? `${s.start_time ?? idx}-${idx}`,
          speaker: s.speaker ?? s.speaker_label ?? "Người nói",
          text: s.text ?? s.transcript ?? s.caption ?? "",
          start: s.start_time ?? s.start ?? null,
          end: s.end_time ?? s.end ?? null,
        }));
      setSegments(segs);
      setLastUpdated(new Date());

      // Update the transcript entry with new segments
      if (segs.length > 0 && currentTranscriptId) {
        await transcripts.updateSegments(currentTranscriptId, segs);
      }
    } catch (e) {
      // Silent error - không hiển thị lỗi khi polling
    }
  }, [currentTranscriptId]);

  async function handleJoinMeeting(e) {
    e.preventDefault()
    setError("")
    if (!codeParsed) {
      setError("Vui lòng nhập link hoặc mã Google Meet hợp lệ (vd: abc-defg-hij).");
      return;
    }
    setMeetCode(codeParsed);
    setSegments([]);
    await callCreateBot(codeParsed);

    // Bước 1: Tự động tạo Meeting trong database thông qua API
    try {
      const meetingTitle = `Meeting ${codeParsed} - ${new Date().toLocaleDateString('vi-VN')}`
      await meetingsApi.create({
        meetId: codeParsed,
        title: meetingTitle,
        platform: 'google_meet',
        participants: [] // Sẽ được cập nhật khi có transcript với speakers
      })
    } catch (meetingError) {
      // Nếu meeting đã tồn tại hoặc lỗi khác, không block flow
    }

    setLoading(true);
    await fetchTranscript(codeParsed);
    setLoading(false);
    if (pollerRef.current) clearInterval(pollerRef.current);
    pollerRef.current = setInterval(() => fetchTranscript(codeParsed), 3000);
    // Create (or ensure) transcript entry without analysis
    const baseText = `Live meeting transcript from Google Meet\nMeeting Link: ${meetLink}\nBot Name: ${botName}\nLanguage: ${language}\nStart Time: ${new Date().toLocaleString()}\n\n[Bot has joined the meeting and is ready to transcribe...]`
    const created = await transcripts.createFromText(baseText, {
      outputLang: language === 'Vietnamese' ? 'Vietnamese' : 'English',
      segments: [],
      meetCode: codeParsed,
      meetingUrl: meetLink
    })
    setCurrentTranscriptId(created.id)
    onAnalyzed(created.id)
  }

  useEffect(() => () => {
    if (pollerRef.current) clearInterval(pollerRef.current);
  }, []);

  return (
    <div className="space-y-4">
      {/* Google Meet Link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cyan-900 flex items-center gap-2">
          <Video size={16} />
          Google Meet Link
        </label>
        <input
          type="url"
          className="w-full rounded-2xl border border-cyan-200/60 px-4 py-3 bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
          placeholder="https://meet.google.com/abc-defg-hij"
          value={meetLink}
          onChange={e => setMeetLink(e.target.value)}
        />
        <p className="text-xs text-cyan-700/70">Paste your Google Meet invitation link here</p>
      </div>

      {/* Bot Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cyan-900 flex items-center gap-2">
          <Bot size={16} />
          Bot Name
        </label>
        <input
          type="text"
          className="w-full rounded-2xl border border-cyan-200/60 px-4 py-3 bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
          placeholder="Note Pro Meeting Bot"
          value={botName}
          onChange={e => setBotName(e.target.value)}
        />
        <p className="text-xs text-cyan-700/70">Name that will appear in the meeting</p>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cyan-900 flex items-center gap-2">
          <Globe size={16} />
          Output Language
        </label>
        <div className="rounded-2xl border border-cyan-200/60 p-4 bg-cyan-50/30">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="liveLang"
                value="Vietnamese"
                checked={language === 'Vietnamese'}
                onChange={() => setLanguage('Vietnamese')}
                className="accent-cyan-500"
              />
              <span className="text-sm text-cyan-800">Vietnamese</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="liveLang"
                value="English"
                checked={language === 'English'}
                onChange={() => setLanguage('English')}
                className="accent-cyan-500"
              />
              <span className="text-sm text-cyan-800">English</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="liveLang"
                value="Japanese"
                checked={language === 'Japanese'}
                onChange={() => setLanguage('Japanese')}
                className="accent-cyan-500"
                disabled
              />
              <span className="text-sm text-cyan-800">Japanese</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="liveLang"
                value="Korean"
                checked={language === 'Korean'}
                onChange={() => setLanguage('Korean')}
                className="accent-cyan-500"
                disabled
              />
              <span className="text-sm text-cyan-800">Korean</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="liveLang"
                value="Chinese"
                checked={language === 'Chinese'}
                onChange={() => setLanguage('Chinese')}
                className="accent-cyan-500"
                disabled
              />
              <span className="text-sm text-cyan-800">Chinese</span>
            </label>
          </div>
        </div>
        <p className="text-xs text-cyan-700/70">Language for transcription and analysis</p>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-white py-2 flex gap-3">
        <button
          disabled={!codeParsed || joining}
          onClick={handleJoinMeeting}
          className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-white py-3 shadow-soft disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {joining ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang gọi bot...</span>
            </>
          ) : (
            <>
              <Video size={18} />
              <span>Bắt đầu</span>
            </>
          )}
        </button>

      </div>

      {/* Status Display */}
      {codeParsed && (
        <div className="rounded-2xl border border-cyan-200/60 bg-cyan-50/20 p-3">
          <p className="text-sm text-cyan-800">
            Mã Meet nhận diện: <span className="font-semibold">{codeParsed}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Live Transcript Panel */}
      {meetCode && (
        <div className="rounded-2xl border border-cyan-200/60 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-medium text-cyan-900">Hội thoại</h4>
              <p className="text-xs text-cyan-700/80">
                {loading ? "Đang tải..." : "Đang cập nhật mỗi 3s"}
                {lastUpdated && <> • cập nhật: {lastUpdated.toLocaleTimeString()}</>}
              </p>
            </div>
            <div className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-lg text-xs font-medium">
              {meetCode}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {segments.length === 0 ? (
              <div className="text-center py-8 text-cyan-700/80 text-sm">
                Chưa có câu thoại. Hãy Admit bot trong phòng.
              </div>
            ) : (
              segments.map((s) => (
                <div key={s.id} className="border border-cyan-100 rounded-lg p-3">
                  <div className="text-xs font-medium text-cyan-600 mb-1">{s.speaker}</div>
                  <div className="text-sm text-cyan-900">{s.text}</div>
                  {(s.start || s.end) && (
                    <div className="text-xs text-cyan-600/70 mt-1">
                      {s.start != null ? `${(s.start).toFixed ? s.start.toFixed(1) : s.start}s` : ""}
                      {s.end != null ? ` → ${(s.end).toFixed ? s.end.toFixed(1) : s.end}s` : ""}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-2xl border border-cyan-200/60 bg-cyan-50/20 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <Bot size={16} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-cyan-900 mb-1">How it works</h4>
            <ul className="text-xs text-cyan-800/80 space-y-1">
              <li>• Bot will join your Google Meet automatically</li>
              <li>• Real-time transcription during the meeting</li>
              <li>• AI analysis available after the meeting ends</li>
              <li>• All participants will see the bot in the meeting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}