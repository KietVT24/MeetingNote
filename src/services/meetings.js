/**
 * Meetings & Analyses API Service
 * Tích hợp với backend API theo api.md
 * 
 * Authentication:
 * - TẤT CẢ Meeting endpoints YÊU CẦU auth token
 * - Token được lấy từ localStorage và gửi trong Authorization header
 */

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

/**
 * Helper: Get auth headers (REQUIRED for all requests)
 */
function getAuthHeaders(includeContentType = false) {
    const token = localStorage.getItem('token');
    const headers = {};
    
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Token is REQUIRED for all meeting endpoints
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

/**
 * Meeting Management APIs
 */
export const meetingsApi = {
    /**
     * Lấy danh sách meetings
     * GET /api/meetings
     * REQUIRES authentication
     * @param {Object} params - { limit, offset, status }
     */
    async list({ limit = 50, offset = 0, status } = {}) {
        const params = new URLSearchParams({ limit, offset })
        if (status) params.append('status', status)

        const res = await fetch(`${backendUrl}/api/meetings?${params}`, {
            headers: getAuthHeaders()
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to fetch meetings')
        }
        return res.json()
    },

    /**
     * Lấy chi tiết meeting
     * GET /api/meetings/:meetId
     * REQUIRES authentication
     * @param {string} meetId
     */
    async get(meetId) {
        const res = await fetch(`${backendUrl}/api/meetings/${meetId}`, {
            headers: getAuthHeaders()
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to fetch meeting')
        }
        return res.json()
    },

    /**
     * Tạo meeting mới
     * POST /api/meetings
     * REQUIRES authentication
     * @param {Object} data - { meetId, title, platform, participants }
     */
    async create({ meetId, title, platform = 'google_meet', participants = [] }) {
        const res = await fetch(`${backendUrl}/api/meetings`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify({ meetId, title, platform, participants })
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to create meeting')
        }
        return res.json()
    },

    /**
     * Cập nhật status meeting
     * PATCH /api/meetings/:meetId/status
     * REQUIRES authentication
     * @param {string} meetId
     * @param {string} status - 'active' | 'ended'
     */
    async updateStatus(meetId, status) {
        const res = await fetch(`${backendUrl}/api/meetings/${meetId}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(true),
            body: JSON.stringify({ status })
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to update meeting status')
        }
        return res.json()
    },

    /**
     * Cập nhật title meeting
     * PATCH /api/meetings/:meetId/title
     * REQUIRES authentication
     * @param {string} meetId
     * @param {string} title
     */
    async updateTitle(meetId, title) {
        const res = await fetch(`${backendUrl}/api/meetings/${meetId}/title`, {
            method: 'PATCH',
            headers: getAuthHeaders(true),
            body: JSON.stringify({ title })
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to update meeting title')
        }
        return res.json()
    },

    /**
     * Xóa meeting
     * DELETE /api/meetings/:meetId
     * REQUIRES authentication
     * @param {string} meetId
     */
    async delete(meetId) {
        const res = await fetch(`${backendUrl}/api/meetings/${meetId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to delete meeting')
        }
        return res.json()
    },

    /**
     * Publish meeting (tạo share URL)
     * POST /api/meetings/:meetId/publish
     * REQUIRES authentication
     * @param {string} meetId
     * @returns {Promise<{success: boolean, shareUrl: string, message: string}>}
     */
    async publish(meetId) {
        const res = await fetch(`${backendUrl}/api/meetings/${meetId}/publish`, {
            method: 'POST',
            headers: getAuthHeaders()
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to publish meeting')
        }
        return res.json()
    },

    /**
     * Unpublish meeting (revoke share URL)
     * POST /api/meetings/:meetId/unpublish
     * REQUIRES authentication
     * @param {string} meetId
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async unpublish(meetId) {
        const res = await fetch(`${backendUrl}/api/meetings/${meetId}/unpublish`, {
            method: 'POST',
            headers: getAuthHeaders()
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to unpublish meeting')
        }
        return res.json()
    }
}

/**
 * Transcript APIs
 */
export const transcriptsApi = {
    /**
     * Lấy transcript của meeting
     * GET /api/bots/transcripts/:platform/:code
     * @param {string} platform - 'google_meet', 'teams', 'zoom'
     * @param {string} code - Meeting code (e.g., 'abc-defg-hij')
     * @param {Object} params - { offset, limit, date }
     */
    async get(platform, code, { offset = 0, limit = 500, date } = {}) {
        const params = new URLSearchParams({ offset, limit })
        if (date) params.append('date', date)

        const res = await fetch(`${backendUrl}/api/bots/transcripts/${platform}/${code}?${params}`)
        if (!res.ok) {
            if (res.status === 404) return null
            const error = await res.text()
            throw new Error(error || 'Failed to fetch transcript')
        }
        return res.json()
    },

    /**
     * Lấy transcript cho Google Meet (shorthand)
     * @param {string} meetId - Meeting ID
     */
    async getGoogleMeet(meetId, options = {}) {
        return this.get('google_meet', meetId, options)
    }
}

/**
 * Public Shared Meeting APIs (No authentication required)
 */
export const sharedMeetingsApi = {
    /**
     * Lấy thông tin meeting được share (public)
     * GET /api/meetings/shared/:shareToken
     * NO authentication required
     * @param {string} shareToken
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    async get(shareToken) {
        const res = await fetch(`${backendUrl}/api/meetings/shared/${shareToken}`)
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to fetch shared meeting')
        }
        return res.json()
    },

    /**
     * Lấy transcript của meeting được share (public)
     * GET /api/meetings/shared/:shareToken/transcript
     * NO authentication required
     * @param {string} shareToken
     * @returns {Promise<{platform: string, segments: Array, total: number}>}
     */
    async getTranscript(shareToken) {
        const res = await fetch(`${backendUrl}/api/meetings/shared/${shareToken}/transcript`)
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to fetch shared transcript')
        }
        return res.json()
    }
}

/**
 * Analysis APIs
 */
export const analysesApi = {
    /**
     * Lấy danh sách analyses của meeting
     * GET /api/analyses/:meetId
     * @param {string} meetId
     * @param {Object} params - { limit, offset }
     */
    async listByMeeting(meetId, { limit = 50, offset = 0 } = {}) {
        const params = new URLSearchParams({ limit, offset })
        const res = await fetch(`${backendUrl}/api/analyses/${meetId}?${params}`)
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to fetch analyses')
        }
        return res.json()
    },

    /**
     * Lấy analysis mới nhất của meeting
     * GET /api/analyses/:meetId/latest
     * @param {string} meetId
     */
    async getLatest(meetId) {
        const res = await fetch(`${backendUrl}/api/analyses/${meetId}/latest`)
        if (!res.ok) {
            if (res.status === 404) return null
            const error = await res.text()
            throw new Error(error || 'Failed to fetch latest analysis')
        }
        return res.json()
    },

    /**
     * Lấy statistics của analyses
     * GET /api/analyses/stats
     * @param {string} meetId - optional
     */
    async getStats(meetId) {
        const params = meetId ? `?meetId=${meetId}` : ''
        const res = await fetch(`${backendUrl}/api/analyses/stats${params}`)
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to fetch analysis stats')
        }
        return res.json()
    },

    /**
     * Xóa analysis
     * DELETE /api/analyses/:id
     * @param {number} id
     */
    async delete(id) {
        const res = await fetch(`${backendUrl}/api/analyses/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || 'Failed to delete analysis')
        }
        return res.json()
    }
}

/**
 * Helper: Lấy meetings kèm theo latest analysis
 * Combine hai API để lấy danh sách đầy đủ cho History page
 * 
 * API Response format:
 * {
 *   success: true,
 *   data: [...meetings],
 *   pagination: { limit, offset, total }
 * }
 */
export async function getMeetingsWithAnalyses({ limit = 50, offset = 0, status } = {}) {
    try {
        // Lấy danh sách meetings
        const response = await meetingsApi.list({ limit, offset, status })

        // Handle cấu trúc response thực tế từ API
        // API trả về: { success, data: [...], pagination: {...} }
        const meetings = response.data || response.meetings || []
        const pagination = response.pagination || {}

        // Lấy latest analysis cho mỗi meeting (parallel)
        const meetingsWithAnalyses = await Promise.all(
            meetings.map(async (meeting) => {
                try {
                    const latestAnalysis = await analysesApi.getLatest(meeting.meet_id)
                    return {
                        ...meeting,
                        latestAnalysis: latestAnalysis || null
                    }
                } catch (e) {
                    // Nếu không có analysis, trả về meeting không có analysis
                    return {
                        ...meeting,
                        latestAnalysis: null
                    }
                }
            })
        )

        return {
            meetings: meetingsWithAnalyses,
            total: pagination.total || meetings.length,
            limit: pagination.limit || limit,
            offset: pagination.offset || offset
        }
    } catch (error) {
        console.error('Error fetching meetings with analyses:', error)
        throw error
    }
}
