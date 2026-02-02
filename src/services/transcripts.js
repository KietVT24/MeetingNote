
const KEY='tps2'
const SAMPLE_SUMMARY_VI = 'Cuộc họp này là một buổi ôn tập tập trung vào ngữ âm tiếng Việt, bao gồm hai bài tập chính. Bài tập 1 yêu cầu người học nghe và chọn từ thích hợp cho 10 câu. Bài tập 2 tập trung vào kỹ năng nghe và điền thanh điệu chính xác vào 7 câu. Người nói 1 đã giới thiệu các bài tập, trong khi Người nói 2 đã đọc các câu mẫu cho cả hai bài tập để thực hành.'
const SAMPLE_HIGHLIGHTS_VI = [
  'Người nói 1 giới thiệu buổi ôn tập ngữ âm tiếng Việt.',
  'Bài 1 yêu cầu nghe và chọn từ thích hợp cho các câu.',
  'Bài 2 yêu cầu nghe và điền thanh điệu vào các câu.',
  'Người nói 2 đọc 10 câu mẫu cho Bài 1.',
  'Người nói 2 đọc 7 câu mẫu cho Bài 2.'
]
const SAMPLE_TODOS_VI = [
  { id: crypto.randomUUID(), text: 'Hoàn thành Bài 1: Nghe và chọn từ thích hợp cho 10 câu.', done: false },
  { id: crypto.randomUUID(), text: 'Hoàn thành Bài 2: Nghe và điền thanh điệu vào 7 câu.', done: false }
]
function seed(){
  if(localStorage.getItem(KEY))return
  const now=new Date()
  const mk=(title, out, n)=>({
    id:crypto.randomUUID(),title, inputLang:'Vietnamese', outputLang:out,
    summary:SAMPLE_SUMMARY_VI,
    highlights:[...SAMPLE_HIGHLIGHTS_VI],
    todos:SAMPLE_TODOS_VI.map(t=>({ ...t, id: crypto.randomUUID() })),
    notes:'',createdAt:new Date(now-(n+1)*86400000).toISOString(), timeLabel:'11:44:42 AM', description:'Buổi ôn tập ngữ âm với hai bài tập: chọn từ và điền thanh điệu.', highlightsCount:n+3
  })
  localStorage.setItem(KEY, JSON.stringify([
    mk('Vietnamese Phonetics Review','English',0),
    mk('Ôn Tập Ngữ Âm Tiếng Việt','Vietnamese',1),
    mk('Ôn tập Ngữ âm tiếng Việt','Vietnamese',2)
  ]))
}
seed()
export const transcripts={
  list(){return Promise.resolve(JSON.parse(localStorage.getItem(KEY)||'[]'))},
  get(id){return Promise.resolve(JSON.parse(localStorage.getItem(KEY)||'[]').find(x=>x.id===id))},
  createFromText(text,{outputLang, analysisResult, segments, meetCode, meetingUrl}){
    const arr=JSON.parse(localStorage.getItem(KEY)||'[]')
    const item={
      id:crypto.randomUUID(),
      title:analysisResult?.title||'New Transcript',
      inputLang:'Vietnamese',
      outputLang,
      summary: analysisResult?.summary || '',
      highlights: analysisResult?.highlights || [],
      // Normalize todos from API shape -> UI shape
      todos: (analysisResult?.todos || []).map(t => ({
        id: crypto.randomUUID(),
        text: t.text || t.task || '',
        rationale: t.rationale || '',
        priority: t.priority || '',
        due: t.due || '',
        owner_hint: t.owner_hint || t.owner || '',
        done: false
      })),
      notes:'',
      createdAt:new Date().toISOString(),
      timeLabel:new Date().toLocaleTimeString(),
      description:text.slice(0,140)+'...',
      highlightsCount: analysisResult?.highlights?.length || 0,
      model: analysisResult?.model || '',
      warnings: analysisResult?.warnings || [],
      // Participation analytics from analyze API
      active_participants: analysisResult?.active_participants || null,
      // Live meeting data
      segments: segments || [],
      meetCode: meetCode || '',
      meetingUrl: meetingUrl || '',
      isLiveMeeting: !!meetCode,
      translatedText: ''
    }
    arr.unshift(item);localStorage.setItem(KEY,JSON.stringify(arr))
    return new Promise(res=>setTimeout(()=>res(item),400))
  },
  analyze(id){return new Promise(res=>setTimeout(()=>{
    const arr=JSON.parse(localStorage.getItem(KEY)||'[]')
    const it=arr.find(x=>x.id===id); if(it){
      // For live meetings, create analysis from segments
      if(it.isLiveMeeting && it.segments?.length > 0) {
        const transcriptText = it.segments.map(s => `${s.speaker}: ${s.text}`).join('\n');
        it.summary = `Cuộc họp trực tuyến với ${it.segments.length} đoạn hội thoại. ${it.segments.slice(0, 2).map(s => s.text).join(' ')}...`;
        it.highlights = it.segments.slice(0, 3).map(s => s.text);
        it.todos = [
          { id: crypto.randomUUID(), text: 'Xem lại nội dung cuộc họp', done: false },
          { id: crypto.randomUUID(), text: 'Thực hiện các hành động đã thảo luận', done: false }
        ];
      } else {
        it.summary=SAMPLE_SUMMARY_VI
        it.highlights=[...SAMPLE_HIGHLIGHTS_VI]
        it.todos=SAMPLE_TODOS_VI.map(t=>({ ...t, id: crypto.randomUUID() }))
      }
      localStorage.setItem(KEY, JSON.stringify(arr));
    }
    res(it)
  },900))},
  applyAnalysis(id, analysisResult){
    const arr=JSON.parse(localStorage.getItem(KEY)||'[]')
    const it=arr.find(x=>x.id===id); if(it){
      it.summary = analysisResult?.summary || ''
      it.highlights = Array.isArray(analysisResult?.highlights)? [...analysisResult.highlights] : []
      it.todos = (analysisResult?.todos||[]).map(t=>({
        id: crypto.randomUUID(),
        text: t.text || t.task || '',
        rationale: t.rationale || '',
        priority: t.priority || '',
        due: t.due || '',
        owner_hint: t.owner_hint || t.owner || '',
        done: false
      }))
      it.model = analysisResult?.model || it.model || ''
      it.warnings = Array.isArray(analysisResult?.warnings)? [...analysisResult.warnings] : []
      // Merge active participants analytics if provided
      if (analysisResult?.active_participants) {
        it.active_participants = analysisResult.active_participants
      }
      it.highlightsCount = it.highlights.length
      localStorage.setItem(KEY, JSON.stringify(arr))
    }
    return Promise.resolve(it)
  },
  updateSegments(id, segments){
    const arr=JSON.parse(localStorage.getItem(KEY)||'[]')
    const item=arr.find(x=>x.id===id)
    if(item){
      item.segments=segments
      localStorage.setItem(KEY,JSON.stringify(arr))
    }
    return Promise.resolve(item)
  },
  setTranslatedText(id, translatedText){
    const arr=JSON.parse(localStorage.getItem(KEY)||'[]')
    const item=arr.find(x=>x.id===id)
    if(item){
      item.translatedText = translatedText || ''
      localStorage.setItem(KEY,JSON.stringify(arr))
    }
    return Promise.resolve(item)
  },
  setMeetingUrl(id, meetingUrl){
    const arr=JSON.parse(localStorage.getItem(KEY)||'[]')
    const item=arr.find(x=>x.id===id)
    if(item){
      item.meetingUrl = meetingUrl || ''
      localStorage.setItem(KEY,JSON.stringify(arr))
    }
    return Promise.resolve(item)
  }
}
