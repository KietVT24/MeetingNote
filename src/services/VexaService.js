// src/services/VexaService.js
import axios from 'axios';
import { config } from '../config/app.js';
import { cleanText } from '../utils/textCleaner.js';

class VexaService {
    constructor() {
        this.baseUrl = config.vexaBaseUrl;
        this.apiKey = config.vexaApiKey;
    }

    /**
     * Get headers for Vexa API
     */
    getHeaders() {
        return {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Create a bot for meeting
     */
    async createBot(options) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/bots`,
                {
                    ...options,
                    language: options.target_language || 'vi',
                    bot_name: options.bot_name || 'Note Pro Meeting Bot'
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error?.response?.data || { error: error.message };
        }
    }

    /**
     * Delete a bot
     */
    async deleteBot(platform, code) {
        try {
            const response = await axios.delete(
                `${this.baseUrl}/bots/${platform}/${code}`,
                { headers: { 'X-API-Key': this.apiKey } }
            );
            return response.data ?? { ok: true };
        } catch (error) {
            throw error?.response?.data || { error: error.message };
        }
    }

    /**
     * Get transcript from Vexa
     */
    async getTranscript(platform, code) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transcripts/${platform}/${code}`,
                { headers: { 'X-API-Key': this.apiKey } }
            );
            return response.data;
        } catch (error) {
            throw error?.response?.data || { error: error.message };
        }
    }

    /**
     * Get and clean transcript
     */
    async getCleanTranscript(platform, code) {
        try {
            const data = await this.getTranscript(platform, code);

            if (Array.isArray(data.segments)) {
                const cleanedSegments = data.segments
                    .map(seg => ({
                        ...seg,
                        text: cleanText(seg.text),
                    }))
                    .filter(seg =>
                        Boolean(seg?.speaker && String(seg.speaker).trim()) &&
                        Boolean(seg.text && seg.text.trim().length > 2)
                    );

                return { ...data, segments: cleanedSegments };
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Fetch and normalize transcript segments
     */
    async fetchTranscriptSegments(platform, code) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transcripts/${platform}/${code}`,
                { headers: { 'X-API-Key': this.apiKey } }
            );

            let segs = [];
            const data = response.data;
            if (Array.isArray(data?.segments)) segs = data.segments;
            else if (Array.isArray(data)) segs = data;
            else if (Array.isArray(data?.results)) segs = data.results;

            return segs
                .filter((s) => s && (s.text || s.transcript || s.caption))
                .map((s, idx) => ({
                    id: s.id ?? `${s.start_time ?? idx}-${idx}`,
                    speaker: s.speaker ?? s.speaker_label ?? 'Người nói',
                    text: s.text ?? s.transcript ?? s.caption ?? '',
                    start: s.start_time ?? s.start ?? null,
                    end: s.end_time ?? s.end ?? null
                }));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validate platform
     */
    static isValidPlatform(platform) {
        const allowedPlatforms = new Set(['google_meet', 'zoom', 'teams']);
        return allowedPlatforms.has(platform);
    }

    /**
     * Validate Google Meet code format
     */
    static isValidMeetCode(code) {
        const meetCodeLike = /^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i;
        return meetCodeLike.test(code);
    }
}

export default new VexaService();
