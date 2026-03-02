// src/services/OpenAIService.js
import { OpenAI } from 'openai';
import { config } from '../config/app.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });
const MODEL_ID = config.openai.model;

const responseSchema = {
    type: 'object',
    required: ['title', 'summary', 'highlights', 'todos'],
    properties: {
        title: {
            type: 'string',
            description: 'Tiêu đề ngắn gọn (dưới 12 từ), tổng quát nội dung.'
        },
        summary: { type: 'string' },
        highlights: {
            type: 'array',
            items: { type: 'string' }
        },
        todos: {
            type: 'array',
            items: {
                type: 'object',
                required: ['task'],
                properties: {
                    task: { type: 'string' },
                    rationale: { type: 'string' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    due: { type: 'string' },
                    owner_hint: { type: 'string' }
                }
            }
        },
        warnings: {
            type: 'array',
            items: { type: 'string' }
        }
    }
};

class OpenAIService {
    /**
     * Build system prompt based on locale
     */
    static buildSystemPrompt(locale = 'vi') {
        const lang = locale?.startsWith('vi') ? 'vi' : 'en';
        return lang === 'vi'
            ? `Bạn là trợ lý AI ngắn gọn & có cấu trúc.
YÊU CẦU:
- Sinh tiêu đề ngắn gọn (≤ 12 từ) phản ánh nội dung, viết vào "title".
- Tồn tại các đoạn hội thoại rác liên quan đến đăng ký kênh youtube, hãy loại bỏ các hội thoại kêu gọi đăng ký kênh.
- Tóm tắt chính xác (8-10 câu), tránh lặp.
- Rút ra tối đa ý chính, mỗi ý ≤ 20 từ.
- Tạo tối đa (>5) việc cần làm (todo) rõ ràng, có priority, due nếu có thể.
- Nếu nội dung mơ hồ, thêm trường 'warnings'.

Trả lời BẰNG JSON theo schema sau:\n\n${JSON.stringify(responseSchema, null, 2)}\n\nKhông thêm lời giải thích.`
            : `You are a structured AI assistant.
REQUIREMENTS:
- Generate a short and clear "title" (≤ 12 words) summarizing the content.
- 3–6 sentence summary.
- Up to max highlights concise bullet points.
- Up to max todos actionable todos with priority, due date.
- Include 'warnings' if ambiguity exists.

Respond ONLY as JSON matching schema:\n\n${JSON.stringify(responseSchema, null, 2)}\n\nDo not add any explanation.`;
    }

    /**
     * Analyze text content
     */
    static async analyze({ text, locale = 'vi', maxHighlights = 8, maxTodos = 10, segments = null }) {
        try {
            const systemPrompt = this.buildSystemPrompt(locale, maxHighlights, maxTodos);

            const result = await openai.chat.completions.create({
                model: MODEL_ID,
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: locale?.startsWith('vi')
                            ? `Văn bản gốc:\n"""${text}"""\n---\nHãy thực hiện yêu cầu.`
                            : `Original text:\n"""${text}"""\n---\nPlease follow the instructions.`
                    }
                ],
                temperature: 0.4,
                max_tokens: 2048
            });

            const raw = result.choices?.[0]?.message?.content;
            if (!raw) throw new Error('Empty response from ChatGPT');

            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                const first = raw.indexOf('{');
                const last = raw.lastIndexOf('}');
                data = JSON.parse(raw.slice(first, last + 1));
            }

            // Compute active participants from provided segments
            let activeParticipants = this.analyzeActiveParticipants(segments);

            // Fallback: parse text lines into segments if not provided
            if (!activeParticipants && typeof text === 'string' && text.includes(':')) {
                const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                const guessed = lines.map((line, i) => {
                    const idx = line.indexOf(':');
                    if (idx > -1 && idx < 80) {
                        const maybeSpeaker = line.slice(0, idx).trim();
                        const content = line.slice(idx + 1).trim();
                        return { speaker: maybeSpeaker || 'Người nói', text: content, start: i * 2, end: i * 2 + Math.max(2, Math.min(8, Math.ceil(content.split(/\s+/).length / 2))) };
                    }
                    return { speaker: 'Người nói', text: line, start: i * 2, end: i * 2 + Math.max(2, Math.min(8, Math.ceil(line.split(/\s+/).length / 2))) };
                });
                activeParticipants = this.analyzeActiveParticipants(guessed);
            }

            return {
                model: MODEL_ID,
                title: data.title,
                summary: data.summary,
                highlights: data.highlights,
                todos: data.todos,
                warnings: data.warnings ?? [],
                active_participants: activeParticipants,
                usage_note: 'Kết quả AI trích xuất có cấu trúc từ OpenAI. Vui lòng kiểm tra lại deadline và priority trước khi áp dụng.'
            };
        } catch (error) {
            console.error('OpenAI analyze error:', error);
            throw error;
        }
    }

    /**
     * Analyze active participants from segments
     */
    static analyzeActiveParticipants(segmentsInput) {
        try {
            if (!Array.isArray(segmentsInput) || segmentsInput.length === 0) {
                return null;
            }

            const normalized = segmentsInput
                .filter(s => s && (s.text || s.sentence || s.transcript))
                .map((s, idx) => ({
                    speaker: (s.speaker || s.speaker_label || 'Người nói').toString().trim() || 'Người nói',
                    text: (s.text || s.sentence || s.transcript || '').toString(),
                    start: typeof s.start === 'number' ? s.start : (typeof s.start_time === 'number' ? s.start_time : null),
                    end: typeof s.end === 'number' ? s.end : (typeof s.end_time === 'number' ? s.end_time : null),
                    at: s.at || null,
                    _i: idx
                }))
                .filter(s => s.text && s.text.trim().length > 0);

            if (normalized.length === 0) return null;

            const bySpeaker = new Map();
            for (const seg of normalized) {
                const name = seg.speaker || 'Người nói';
                if (!bySpeaker.has(name)) {
                    bySpeaker.set(name, {
                        speaker: name,
                        turns: 0,
                        words: 0,
                        durationSec: 0,
                    });
                }
                const acc = bySpeaker.get(name);
                acc.turns += 1;
                const wordCount = seg.text.trim().split(/\s+/).filter(Boolean).length;
                acc.words += wordCount;
                if (typeof seg.start === 'number' && typeof seg.end === 'number' && seg.end >= seg.start) {
                    acc.durationSec += (seg.end - seg.start);
                }
            }

            const list = Array.from(bySpeaker.values()).map(it => ({
                ...it,
                speakingRateWpm: it.durationSec > 0 ? Math.round((it.words / (it.durationSec / 60)) * 10) / 10 : null,
                rawScore: it.words + it.turns * 5 + (it.durationSec || 0) * 0.5
            }));

            // Normalize scores to scale of 10
            const maxRawScore = Math.max(...list.map(item => item.rawScore));
            const minRawScore = Math.min(...list.map(item => item.rawScore));
            const scoreRange = maxRawScore - minRawScore;

            const normalizedList = list.map(it => ({
                ...it,
                score: scoreRange > 0
                    ? Math.round(((it.rawScore - minRawScore) / scoreRange) * 10 * 10) / 10
                    : 10
            }));

            normalizedList.sort((a, b) => b.score - a.score || b.words - a.words || b.turns - a.turns);

            const labels = normalizedList.map(i => i.speaker);
            const dataWords = normalizedList.map(i => i.words);
            const dataTurns = normalizedList.map(i => i.turns);
            const dataDuration = normalizedList.map(i => Math.round(i.durationSec));
            const dataScores = normalizedList.map(i => i.score);

            return {
                summary: {
                    totalParticipants: normalizedList.length,
                    totalTurns: normalizedList.reduce((s, i) => s + i.turns, 0),
                    totalWords: normalizedList.reduce((s, i) => s + i.words, 0)
                },
                ranking: normalizedList,
                chart: {
                    type: 'bar',
                    labels,
                    datasets: [
                        { key: 'words', label: 'Số từ', data: dataWords },
                        { key: 'turns', label: 'Lượt phát biểu', data: dataTurns },
                        { key: 'durationSec', label: 'Thời lượng (giây)', data: dataDuration },
                        { key: 'score', label: 'Điểm tích cực (0-10)', data: dataScores }
                    ]
                }
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Chat with context
     */
    static async chat({ summary, highlights, todos, message }) {
        try {
            const systemPrompt = `Bạn là trợ lý AI đang hỗ trợ một đồ án tốt nghiệp. Dưới đây là bối cảnh của dự án:

📌 **Tóm tắt**:
${summary}

📌 **Ý chính**:
${highlights.map((h) => `- ${h}`).join('\n')}

📌 **Công việc cần làm (todos)**:
${todos.map((t) => `• ${t.task} (${t.priority ?? 'priority?'})`).join('\n')}

Hãy trả lời câu hỏi từ người dùng dựa trên bối cảnh trên. Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, có đề xuất cụ thể nếu có.`;

            const chatRes = await openai.chat.completions.create({
                model: MODEL_ID,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 1024
            });

            const reply = chatRes.choices?.[0]?.message?.content;
            if (!reply) throw new Error('Empty response from ChatGPT');

            return { output: reply };
        } catch (error) {
            console.error('OpenAI chat error:', error);
            throw error;
        }
    }

    /**
     * Chat with transcript data directly
     * @param {Object} params
     * @param {Array} params.transcripts - Array of transcript segments
     * @param {string} params.message - User's question
     * @param {Array} params.history - Previous chat history (optional)
     * @param {string} params.locale - Language (vi/en)
     */
    static async chatWithTranscript({ transcripts, message, history = [], locale = 'vi' }) {
        try {
            // Format transcript into readable text
            const transcriptText = transcripts
                .map((t, idx) => {
                    const speaker = t.speaker || t.speaker_label || 'Người nói';
                    const text = t.text || t.transcript || t.sentence || '';
                    const time = t.recorded_at
                        ? new Date(t.recorded_at).toLocaleTimeString('vi-VN')
                        : (t.start ? `${Math.floor(t.start / 60)}:${String(Math.floor(t.start % 60)).padStart(2, '0')}` : '');
                    return `[${time}] ${speaker}: ${text}`;
                })
                .join('\n');

            // Get unique speakers
            const speakers = [...new Set(transcripts.map(t => t.speaker || t.speaker_label).filter(Boolean))];

            const isVietnamese = locale?.startsWith('vi');

            const systemPrompt = isVietnamese
                ? `Bạn là trợ lý AI thông minh, chuyên phân tích và trả lời câu hỏi dựa trên nội dung cuộc họp.

📋 **THÔNG TIN CUỘC HỌP**:
- Số người tham gia: ${speakers.length}
- Người tham gia: ${speakers.join(', ') || 'Không xác định'}
- Tổng số phát ngôn: ${transcripts.length}

📝 **NỘI DUNG CUỘC HỌP**:
"""
${transcriptText}
"""

🎯 **HƯỚNG DẪN**:
- Trả lời dựa trên NỘI DUNG CUỘC HỌP ở trên
- Nếu thông tin không có trong transcript, hãy nói rõ điều đó
- Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng
- Có thể trích dẫn nguyên văn từ transcript nếu cần
- Nếu được hỏi về ai nói gì, hãy chỉ rõ tên người nói`
                : `You are an intelligent AI assistant that analyzes and answers questions based on meeting content.

📋 **MEETING INFO**:
- Participants: ${speakers.length}
- Speakers: ${speakers.join(', ') || 'Unknown'}
- Total utterances: ${transcripts.length}

📝 **MEETING CONTENT**:
"""
${transcriptText}
"""

🎯 **GUIDELINES**:
- Answer based on the MEETING CONTENT above
- If information is not in the transcript, say so clearly
- Be concise and clear
- Quote directly from transcript when needed
- If asked who said what, specify the speaker's name`;

            // Build messages array with history
            const messages = [
                { role: 'system', content: systemPrompt }
            ];

            // Add chat history if provided
            if (history && history.length > 0) {
                for (const h of history) {
                    if (h.role && h.content) {
                        messages.push({
                            role: h.role === 'user' ? 'user' : 'assistant',
                            content: h.content
                        });
                    }
                }
            }

            // Add current message
            messages.push({ role: 'user', content: message });

            const chatRes = await openai.chat.completions.create({
                model: MODEL_ID,
                messages,
                temperature: 0.7,
                max_tokens: 2048
            });

            const reply = chatRes.choices?.[0]?.message?.content;
            if (!reply) throw new Error('Empty response from ChatGPT');

            return {
                reply,
                model: MODEL_ID,
                usage: chatRes.usage,
                context: {
                    speakers,
                    totalUtterances: transcripts.length,
                    transcriptLength: transcriptText.length
                }
            };
        } catch (error) {
            console.error('OpenAI chatWithTranscript error:', error);
            throw error;
        }
    }
}

export default OpenAIService;
