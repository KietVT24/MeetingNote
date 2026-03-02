// src/services/TranscriptService.js
import Transcript from '../models/Transcript.js';
import Meeting from '../models/Meeting.js';
import { cleanText } from '../utils/textCleaner.js';
import path from 'path';
import fs from 'fs/promises';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

class TranscriptService {
    /**
     * Save a new transcript entry (both to DB and file for backward compatibility)
     */
    static async saveTranscript({ meetId, speaker, text, recordedAt, startTime, endTime, metadata }) {
        try {
            // Clean text before saving
            const cleanedText = cleanText(text);

            if (!cleanedText || cleanedText.trim().length < 3) {
                return null; // Skip empty or too short text
            }

            // Ensure meeting exists
            await Meeting.upsert({ meetId });

            // Save to database
            const transcript = await Transcript.create({
                meetId,
                speaker,
                text: cleanedText,
                recordedAt: recordedAt || new Date().toISOString(),
                startTime,
                endTime,
                metadata
            });

            // Also save to file for backward compatibility
            await this.appendToFile(meetId, {
                meetId,
                at: recordedAt || new Date().toISOString(),
                speaker,
                text: cleanedText
            });

            return transcript;
        } catch (error) {
            console.error('Error saving transcript:', error);
            throw error;
        }
    }

    /**
     * Append to NDJSON file (backward compatibility)
     */
    static async appendToFile(meetId, record) {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            const safeMeetId = meetId.replace(/[^a-zA-Z0-9\-_]/g, '_');
            const filePath = path.join(DATA_DIR, `${safeMeetId}.txt`);
            const line = JSON.stringify(record, null, 0) + '\n';
            await fs.appendFile(filePath, line, { encoding: 'utf-8' });
        } catch (error) {
            console.error('Error appending to file:', error);
        }
    }

    /**
     * Get all transcripts for a meeting
     */
    static async getTranscripts(meetId, options = {}) {
        try {
            const transcripts = await Transcript.findByMeetId(meetId, options);

            // Deduplicate consecutive same text + speaker
            const deduped = [];
            for (const t of transcripts) {
                const prev = deduped[deduped.length - 1];
                if (prev && prev.text === t.text && prev.speaker === t.speaker) continue;
                deduped.push(t);
            }

            return deduped;
        } catch (error) {
            console.error('Error getting transcripts:', error);
            throw error;
        }
    }

    /**
     * Get latest transcript
     */
    static async getLatest(meetId) {
        return Transcript.findLatest(meetId);
    }

    /**
     * Get full transcript in various formats
     */
    static async getFormattedTranscript(meetId, format = 'txt') {
        try {
            const transcripts = await this.getTranscripts(meetId);

            switch (format) {
                case 'json':
                    return { ok: true, meetId, count: transcripts.length, items: transcripts };
                case 'md':
                    return this.toMarkdown(transcripts);
                case 'srt':
                    return this.toSrt(transcripts);
                case 'vtt':
                    return this.toVtt(transcripts);
                case 'txt':
                default:
                    return this.toText(transcripts);
            }
        } catch (error) {
            console.error('Error getting formatted transcript:', error);
            throw error;
        }
    }

    /**
     * Convert to plain text
     */
    static toText(items) {
        return items.map(it => {
            const who = it.speaker ? `${it.speaker}: ` : '';
            return `${who}${it.text}`;
        }).join('\n');
    }

    /**
     * Convert to Markdown
     */
    static toMarkdown(items) {
        return items.map(it => {
            const who = it.speaker ? `**${it.speaker}:** ` : '';
            return `- ${who}${it.text}`;
        }).join('\n');
    }

    /**
     * Convert to SRT format
     */
    static toSrt(items) {
        const pad = n => String(n).padStart(2, '0');
        const getMs = d => {
            const t = new Date(d).getTime();
            return isFinite(t) ? t : Date.now();
        };

        return items.map((it, i) => {
            const start = getMs(it.recorded_at || it.at) + i * 10;
            const end = start + 2000;
            const formatTime = ts => {
                const h = pad(new Date(ts).getUTCHours());
                const m = pad(new Date(ts).getUTCMinutes());
                const s = pad(new Date(ts).getUTCSeconds());
                const mmm = String(new Date(ts).getUTCMilliseconds()).padStart(3, '0');
                return `${h}:${m}:${s},${mmm}`;
            };
            const who = it.speaker ? `${it.speaker}: ` : '';
            return `${i + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${who}${it.text}\n`;
        }).join('\n');
    }

    /**
     * Convert to VTT format
     */
    static toVtt(items) {
        const pad = n => String(n).padStart(2, '0');
        const getMs = d => {
            const t = new Date(d).getTime();
            return isFinite(t) ? t : Date.now();
        };
        const formatTime = ts => {
            const h = pad(new Date(ts).getUTCHours());
            const m = pad(new Date(ts).getUTCMinutes());
            const s = pad(new Date(ts).getUTCSeconds());
            const mmm = String(new Date(ts).getUTCMilliseconds()).padStart(3, '0');
            return `${h}:${m}:${s}.${mmm}`;
        };

        const body = items.map((it, i) => {
            const start = getMs(it.recorded_at || it.at) + i * 10;
            const end = start + 2000;
            const who = it.speaker ? `${it.speaker}: ` : '';
            return `${formatTime(start)} --> ${formatTime(end)}\n${who}${it.text}\n\n`;
        }).join('\n');

        return `WEBVTT\n\n${body}`;
    }

    /**
     * Get transcript statistics
     */
    static async getStats(meetId) {
        return Transcript.getStats(meetId);
    }

    /**
     * Delete all transcripts for a meeting
     */
    static async deleteTranscripts(meetId) {
        try {
            // Delete from database
            const deletedCount = await Transcript.deleteByMeetId(meetId);

            // Delete file
            const safeMeetId = meetId.replace(/[^a-zA-Z0-9\-_]/g, '_');
            const filePath = path.join(DATA_DIR, `${safeMeetId}.txt`);
            try {
                await fs.unlink(filePath);
            } catch (e) {
                // File might not exist
            }

            return deletedCount;
        } catch (error) {
            console.error('Error deleting transcripts:', error);
            throw error;
        }
    }

    /**
     * Migrate existing file-based transcripts to database
     */
    static async migrateFromFile(meetId) {
        try {
            const safeMeetId = meetId.replace(/[^a-zA-Z0-9\-_]/g, '_');
            const filePath = path.join(DATA_DIR, `${safeMeetId}.txt`);

            const exists = await fs.access(filePath).then(() => true).catch(() => false);
            if (!exists) return { migrated: 0, skipped: 0 };

            const raw = await fs.readFile(filePath, 'utf-8');
            const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);

            let migrated = 0;
            let skipped = 0;

            for (const line of lines) {
                try {
                    const item = JSON.parse(line);
                    await Transcript.create({
                        meetId: item.meetId || meetId,
                        speaker: item.speaker,
                        text: item.text,
                        recordedAt: item.at || new Date().toISOString()
                    });
                    migrated++;
                } catch (e) {
                    skipped++;
                }
            }

            return { migrated, skipped };
        } catch (error) {
            console.error('Error migrating from file:', error);
            throw error;
        }
    }
}

export default TranscriptService;
