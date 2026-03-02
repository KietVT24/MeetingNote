import { useEffect, useMemo, useState } from 'react'
import { transcripts } from '../services/transcripts'
import { BarChart2 } from 'lucide-react'

export default function ActiveParticipantsDashboard({ id }){
  const [item, setItem] = useState(null)

  useEffect(()=>{
    let mounted = true
    if(!id){ setItem(null); return }
    transcripts.get(id).then(it=>{ if(mounted) setItem(it||null) })
    return ()=>{ mounted = false }
  }, [id])

  const ap = item?.active_participants
  const hasData = !!ap && (Array.isArray(ap?.ranking) ? ap.ranking.length>0 : false)

  const normalizedCharts = useMemo(()=>{
    if(!ap?.chart) return []
    return (ap.chart.datasets || []).map(ds=>{
      const values = ds.data || []
      const max = Math.max(1, ...values)
      return {
        key: ds.key || 'metric',
        label: ds.label || 'Metric',
        values,
        max
      }
    })
  }, [ap])

  if(!id){
    return (
      <div className="rounded-2xl border border-cyan-200/60 bg-white p-4">
        <div className="text-sm text-cyan-800/80">Chọn transcript để xem Dashboard.</div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-cyan-200/60 bg-white p-4 mt-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
          <BarChart2 size={18} />
        </div>
        <div>
          <div className="text-cyan-900 font-semibold">Active Participants Dashboard</div>
          <div className="text-xs text-cyan-700/80">Mức độ tham gia theo dữ liệu AI</div>
        </div>
      </div>

      {!hasData ? (
        <div className="text-sm text-cyan-800/80">Chưa có dữ liệu tham gia.</div>
      ) : (
        <div className="space-y-6">
          {ap?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                <div className="text-xs text-cyan-600/80">Tổng người tham gia</div>
                <div className="text-xl font-semibold text-cyan-900">{ap.summary.totalParticipants ?? '-'}</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                <div className="text-xs text-cyan-600/80">Tổng lượt phát biểu</div>
                <div className="text-xl font-semibold text-cyan-900">{ap.summary.totalTurns ?? '-'}</div>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                <div className="text-xs text-cyan-600/80">Tổng số từ</div>
                <div className="text-xl font-semibold text-cyan-900">{ap.summary.totalWords ?? '-'}</div>
              </div>
            </div>
          )}

          {/* Ranking */}
          <div>
            <div className="text-sm font-semibold text-cyan-900 mb-2">Xếp hạng đóng góp</div>
            <div className="space-y-2">
              {ap.ranking.map((p, i)=>(
                <div key={p.speaker + i} className="border border-cyan-100 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-cyan-900 whitespace-normal break-words">{p.speaker}</div>
                    <div className="text-xs text-cyan-600/80">Score: {p.score ?? '-'}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-cyan-700/90">
                    <div>Lượt: <span className="font-medium">{p.turns ?? '-'}</span></div>
                    <div>Từ: <span className="font-medium">{p.words ?? '-'}</span></div>
                    <div>Thời lượng: <span className="font-medium">{p.durationSec ?? '-'}s</span></div>
                    <div>Tốc độ: <span className="font-medium">{p.speakingRateWpm ?? '-'} wpm</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          {ap.chart && (
            <div>
              <div className="text-sm font-semibold text-cyan-900 mb-3">Biểu đồ</div>
              <div className="space-y-6">
                {normalizedCharts.map((ds, idx)=>(
                  <div key={ds.key + idx}>
                    <div className="text-xs text-cyan-700/90 mb-2">{ds.label}</div>
                    <div className="overflow-x-auto">
                      <div className="flex items-end gap-4 h-48 border-b border-cyan-100 pb-3 min-w-max pr-2">
                        {(ap.chart.labels || []).map((label, i)=>{
                          const value = ds.values?.[i] ?? 0
                          const height = Math.round((value / ds.max) * 100)
                          return (
                            <div key={label + i} className="w-16 flex flex-col items-center">
                              <div className="w-10 bg-cyan-500/80 rounded-t" style={{ height: `${height}%` }} />
                              <div className="mt-1 text-[10px] text-cyan-700/80 text-center">{value}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-2 flex gap-4 min-w-max pr-2">
                        {(ap.chart.labels || []).map((label, i)=> (
                          <div key={label + i} className="w-16 text-[11px] leading-snug text-cyan-700/80 text-center whitespace-normal break-words px-1">{label}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


