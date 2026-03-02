// src/services/BotService.js
// Unified Bot Service with fallback mechanism
// Primary: New Bot (API-GUIDE.md) -> Fallback: Vexa Bot (user_api_guide.md)

import axios from 'axios';
import { config } from '../config/app.js';

// Configuration for both bots
const NEW_BOT_CONFIG = {
    baseUrl: process.env.NEW_BOT_URL || 'http://localhost:1010',
    timeout: 10000,
    name: 'NewBot'
};

const VEXA_BOT_CONFIG = {
    baseUrl: config.vexaBaseUrl,
    apiKey: config.vexaApiKey,
    timeout: 15000,
    name: 'VexaBot'
};

class BotService {
    /**
     * Create a bot with fallback mechanism
     * Primary: New Bot -> Fallback: Vexa Bot
     */
    static async createBot(params) {
        console.log('📥 [BotService] Received params:', JSON.stringify(params, null, 2));

        const {
            platform = 'google_meet',
            meetingUrl,
            meetUrl,
            native_meeting_id,
            language,
            bot_name,
            botName,
            duration,
            passcode
        } = params;

        // Normalize meeting URL
        const fullMeetUrl = meetingUrl || meetUrl;
        
        // Extract meeting code from URL
        let meetingCode = native_meeting_id;
        if (!meetingCode && fullMeetUrl) {
            const match = fullMeetUrl.match(/meet\.google\.com\/([a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3})/i);
            if (match) {
                meetingCode = match[1];
            }
        }

        if (!meetingCode) {
            throw new Error('Cannot extract meeting code from URL');
        }

        // Build full URL if needed
        const meetingUrlFull = fullMeetUrl || `https://meet.google.com/${meetingCode}`;

        // Try New Bot first (only supports Google Meet)
        if (platform === 'google_meet') {
            try {
                console.log(`🤖 [BotService] Trying New Bot for meeting: ${meetingCode}`);
                const result = await this.createNewBot({
                    meetUrl: meetingUrlFull,
                    native_meeting_id: meetingCode,
                    language: language || 'vi',
                    botName: botName || bot_name || 'Note Pro Meeting Bot',
                    duration: duration || 180
                });

                console.log('✅ [BotService] New Bot success:', result);
                return {
                    success: true,
                    provider: 'new_bot',
                    data: result,
                    meetingCode
                };
            } catch (error) {
                const errorMsg = error.response?.data?.error || error.message;
                console.warn(`⚠️ [BotService] New Bot failed: ${errorMsg}. Falling back to Vexa...`);
            }
        }

        // Fallback to Vexa Bot
        try {
            console.log(`🤖 [BotService] Using Vexa Bot for meeting: ${meetingCode}`);
            const result = await this.createVexaBot({
                platform,
                native_meeting_id: meetingCode,
                language: language || 'vi',
                bot_name: bot_name || botName || 'Note Pro Meeting Bot',
                passcode
            });

            console.log('✅ [BotService] Vexa Bot success:', result);
            return {
                success: true,
                provider: 'vexa',
                data: result,
                meetingCode
            };
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            const errorDetails = error.response?.data || error.message;
            console.error(`❌ [BotService] Vexa Bot also failed: ${errorMsg}`);
            console.error('❌ [BotService] Error details:', errorDetails);
            
            throw {
                success: false,
                error: 'Both bot providers failed',
                details: {
                    newBot: 'Connection refused or not available',
                    vexa: errorDetails
                }
            };
        }
    }

    /**
     * Create bot using New Bot API (API-GUIDE.md)
     * 
     * Endpoint: POST /bots
     * Body: {
     *   meetUrl: string (required) - Full Google Meet URL
     *   duration: number (optional) - Duration in minutes, default 180
     *   native_meeting_id: string (optional) - Meeting code
     *   botName: string (optional) - Bot display name
     *   language: string (optional) - Language code (vi, en, etc)
     * }
     */
    static async createNewBot({ meetUrl, native_meeting_id, language, botName, duration }) {
        const payload = {
            meetUrl: meetUrl,
            duration: duration || 180,
            native_meeting_id: native_meeting_id,
            botName: botName || 'Note Pro Meeting Bot',
            language: language || 'vi'
        };

        console.log('📤 [BotService] New Bot request:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            `${NEW_BOT_CONFIG.baseUrl}/bots`,
            payload,
            {
                timeout: NEW_BOT_CONFIG.timeout,
                headers: { 'Content-Type': 'application/json' }
            }
        );

        console.log('📥 [BotService] New Bot response:', JSON.stringify(response.data, null, 2));

        if (!response.data.success) {
            throw new Error(response.data.error || 'New Bot creation failed');
        }

        // Return normalized response
        return {
            success: true,
            sessionId: response.data.sessionId,
            meetingId: response.data.meetingId || native_meeting_id,
            status: response.data.status,
            message: response.data.message,
            outputFile: response.data.outputFile,
            duration: response.data.duration,
            botName: response.data.botName,
            language: response.data.language
        };
    }

    /**
     * Create bot using Vexa API (user_api_guide.md)
     * 
     * Endpoint: POST /bots
     * Headers: X-API-Key
     * Body: {
     *   platform: string (required) - "google_meet" or "teams"
     *   native_meeting_id: string (required) - Meeting code (abc-defg-hij for Google Meet)
     *   language: string (optional) - Language code (en, vi, etc)
     *   bot_name: string (optional) - Bot display name
     *   passcode: string (required for Teams) - Meeting passcode
     * }
     */
    static async createVexaBot({ platform, native_meeting_id, language, bot_name, passcode }) {
        const payload = {
            platform: platform || 'google_meet',
            native_meeting_id: native_meeting_id,
            language: language || 'vi',
            bot_name: bot_name || 'Note Pro Meeting Bot'
        };

        // Add passcode for Teams
        if (platform === 'teams' && passcode) {
            payload.passcode = passcode;
        }

        console.log('📤 [BotService] Vexa request to:', `${VEXA_BOT_CONFIG.baseUrl}/bots`);
        console.log('📤 [BotService] Vexa payload:', JSON.stringify(payload, null, 2));
        console.log('📤 [BotService] Vexa API Key:', VEXA_BOT_CONFIG.apiKey ? '✅ Set' : '❌ Missing');

        const response = await axios.post(
            `${VEXA_BOT_CONFIG.baseUrl}/bots`,
            payload,
            {
                timeout: VEXA_BOT_CONFIG.timeout,
                headers: {
                    'X-API-Key': VEXA_BOT_CONFIG.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('📥 [BotService] Vexa response:', JSON.stringify(response.data, null, 2));
        return response.data;
    }

    /**
     * Get transcript with fallback mechanism
     */
    static async getTranscript(platform, meetingId, options = {}) {
        const { offset = 0, limit = 500, date } = options;
        let lastError = null;

        // Try New Bot first (only for Google Meet)
        if (platform === 'google_meet') {
            try {
                console.log(`📝 [BotService] Trying New Bot transcript for: ${meetingId}`);
                const result = await this.getNewBotTranscript(meetingId, { offset, limit, date });

                return {
                    success: true,
                    provider: 'new_bot',
                    data: this.normalizeTranscript(result, 'new_bot')
                };
            } catch (error) {
                lastError = error;
                const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
                console.warn(`⚠️ [BotService] New Bot transcript failed: ${errorMsg}. Falling back to Vexa...`);
            }
        }

        // Fallback to Vexa
        try {
            console.log(`📝 [BotService] Using Vexa transcript for: ${meetingId}`);
            const result = await this.getVexaTranscript(platform, meetingId);

            return {
                success: true,
                provider: 'vexa',
                data: this.normalizeTranscript(result, 'vexa')
            };
        } catch (error) {
            const vexaErrorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
            const newBotErrorMsg = lastError?.response?.data?.error || lastError?.message || 'Not attempted';

            console.error(`❌ [BotService] Vexa transcript also failed: ${vexaErrorMsg}`);

            const status = error?.response?.status || lastError?.response?.status || 500;
            const err = new Error('Both providers failed to get transcript');
            err.status = status;
            err.details = {
                newBot: newBotErrorMsg,
                vexa: vexaErrorMsg
            };
            throw err;
        }
    }

    /**
     * Get transcript from New Bot (API-GUIDE.md)
     * Endpoint: GET /transcripts/google_meet/{meetingId}
     */
    static async getNewBotTranscript(meetingId, options = {}) {
        const { offset = 0, limit = 500, date } = options;

        const params = new URLSearchParams();
        if (offset) params.append('offset', offset);
        if (limit) params.append('limit', limit);
        if (date) params.append('date', date);

        const url = `${NEW_BOT_CONFIG.baseUrl}/transcripts/google_meet/${meetingId}${params.toString() ? '?' + params.toString() : ''}`;

        const response = await axios.get(url, {
            timeout: NEW_BOT_CONFIG.timeout
        });

        return response.data;
    }

    /**
     * Get transcript from Vexa (user_api_guide.md)
     * Endpoint: GET /transcripts/{platform}/{native_meeting_id}
     */
    static async getVexaTranscript(platform, meetingId) {
        const url = `${VEXA_BOT_CONFIG.baseUrl}/transcripts/${platform}/${meetingId}`;
        
        console.log('📤 [BotService] Vexa transcript request:');
        console.log('   URL:', url);
        console.log('   API Key:', VEXA_BOT_CONFIG.apiKey ? `${VEXA_BOT_CONFIG.apiKey.substring(0, 10)}...` : '❌ MISSING');
        console.log('   Platform:', platform);
        console.log('   Meeting ID:', meetingId);

        const response = await axios.get(url, {
            timeout: VEXA_BOT_CONFIG.timeout,
            headers: { 'X-API-Key': VEXA_BOT_CONFIG.apiKey }
        });

        console.log('📥 [BotService] Vexa transcript response status:', response.status);
        console.log('📥 [BotService] Vexa transcript segments:', response.data?.segments?.length || 0);

        return response.data;
    }

    /**
     * Normalize transcript response to unified format
     */
    static normalizeTranscript(data, provider) {
        const segments = data.segments || [];

        const normalizedSegments = segments.map((seg, idx) => ({
            id: seg.id || `${idx}`,
            speaker: seg.speaker || seg.speaker_label || 'Người nói',
            text: seg.text || seg.transcript || seg.caption || '',
            start: seg.start ?? seg.start_time ?? null,
            end: seg.end ?? seg.end_time ?? null,
            language: seg.language || null,
            created_at: seg.created_at || seg.absolute_start_time || null
        }));

        return {
            platform: data.platform || 'google_meet',
            native_meeting_id: data.native_meeting_id || data.meetingId,
            status: data.status || 'active',
            start_time: data.start_time || null,
            end_time: data.end_time || null,
            segments: normalizedSegments,
            total: data.total_lines || data.total || normalizedSegments.length,
            provider
        };
    }

    /**
     * Stop bot with fallback
     */
    static async stopBot(platform, meetingId, sessionId = null) {
        // Try New Bot first if we have sessionId
        if (sessionId) {
            try {
                console.log(`🛑 [BotService] Stopping New Bot session: ${sessionId}`);
                const result = await this.stopNewBot(sessionId);

                return {
                    success: true,
                    provider: 'new_bot',
                    data: result
                };
            } catch (error) {
                console.warn(`⚠️ [BotService] New Bot stop failed: ${error.message}. Trying Vexa...`);
            }
        }

        // Try Vexa
        try {
            console.log(`🛑 [BotService] Stopping Vexa Bot for: ${meetingId}`);
            const result = await this.stopVexaBot(platform, meetingId);

            return {
                success: true,
                provider: 'vexa',
                data: result
            };
        } catch (error) {
            console.error(`❌ [BotService] Failed to stop bot: ${error.message}`);
            throw {
                success: false,
                error: 'Failed to stop bot',
                details: error.message || error
            };
        }
    }

    /**
     * Stop New Bot session (API-GUIDE.md)
     * Endpoint: POST /stop-bot/{sessionId}
     */
    static async stopNewBot(sessionId) {
        const response = await axios.post(
            `${NEW_BOT_CONFIG.baseUrl}/stop-bot/${sessionId}`,
            {},
            {
                timeout: NEW_BOT_CONFIG.timeout,
                headers: { 'Content-Type': 'application/json' }
            }
        );

        return response.data;
    }

    /**
     * Stop Vexa Bot (user_api_guide.md)
     * Endpoint: DELETE /bots/{platform}/{native_meeting_id}
     */
    static async stopVexaBot(platform, meetingId) {
        const response = await axios.delete(
            `${VEXA_BOT_CONFIG.baseUrl}/bots/${platform}/${meetingId}`,
            {
                timeout: VEXA_BOT_CONFIG.timeout,
                headers: { 'X-API-Key': VEXA_BOT_CONFIG.apiKey }
            }
        );

        return response.data ?? { ok: true };
    }

    /**
     * Get bot status
     */
    static async getBotStatus() {
        const results = {
            newBot: null,
            vexa: null
        };

        // Try New Bot
        try {
            const response = await axios.get(
                `${NEW_BOT_CONFIG.baseUrl}/sessions`,
                { timeout: NEW_BOT_CONFIG.timeout }
            );
            results.newBot = {
                available: true,
                sessions: response.data.sessions || [],
                total: response.data.total || 0
            };
        } catch (error) {
            results.newBot = { available: false, error: error.message };
        }

        // Try Vexa
        try {
            const response = await axios.get(
                `${VEXA_BOT_CONFIG.baseUrl}/bots/status`,
                {
                    timeout: VEXA_BOT_CONFIG.timeout,
                    headers: { 'X-API-Key': VEXA_BOT_CONFIG.apiKey }
                }
            );
            results.vexa = {
                available: true,
                data: response.data
            };
        } catch (error) {
            results.vexa = { available: false, error: error.message };
        }

        return results;
    }

    /**
     * Health check for both providers
     */
    static async healthCheck() {
        const results = {
            newBot: false,
            vexa: false
        };

        // Check New Bot
        try {
            const response = await axios.get(
                `${NEW_BOT_CONFIG.baseUrl}/health`,
                { timeout: 5000 }
            );
            results.newBot = response.data?.status === 'OK' || response.status === 200;
        } catch (error) {
            results.newBot = false;
        }

        // Check Vexa
        try {
            const response = await axios.get(
                `${VEXA_BOT_CONFIG.baseUrl}/bots/status`,
                {
                    timeout: 5000,
                    headers: { 'X-API-Key': VEXA_BOT_CONFIG.apiKey }
                }
            );
            results.vexa = response.status === 200;
        } catch (error) {
            // Vexa might return 401 if no active bots, which is still "healthy"
            results.vexa = error?.response?.status !== undefined;
        }

        return {
            ...results,
            primary: results.newBot ? 'new_bot' : (results.vexa ? 'vexa' : 'none')
        };
    }
}

export default BotService;
