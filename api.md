# 📖 API Documentation - XinK Analysis Meeting Backend

Hướng dẫn sử dụng toàn bộ API của XinK Analysis Meeting Backend.

**Base URL:** `http://localhost:3001` (hoặc domain production)

---

## 📑 Mục Lục

1. [Health Check](#1-health-check)
2. [Bot Management](#2-bot-management)
3. [Transcript Management](#3-transcript-management)
4. [Meeting Management](#4-meeting-management)
5. [OpenAI Analysis](#5-openai-analysis)
6. [URL Management](#6-url-management)
7. [File Management](#7-file-management)
8. [Socket.IO Events](#8-socketio-events)

---

## 1. Health Check

### 1.1 Server Status

Kiểm tra server có đang hoạt động không.

```http
GET /
```

**Response (200 OK)**
```
✅ Proxy + Socket + OpenAI API is running.
```

---

### 1.2 Health Check JSON

```http
GET /health
```

**Response (200 OK)**
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T15:51:55.123Z"
}
```

---

### 1.3 Bot Providers Health Check

Kiểm tra trạng thái của cả hai bot providers (New Bot và Vexa).

```http
GET /api/bots/health
```

**Response (200 OK)**
```json
{
  "status": "OK",
  "providers": {
    "newBot": true,
    "vexa": true,
    "primary": "new_bot"
  },
  "message": "✅ All providers healthy"
}
```

**Response khi có vấn đề (200 OK)**
```json
{
  "status": "DEGRADED",
  "providers": {
    "newBot": false,
    "vexa": true,
    "primary": "vexa"
  },
  "message": "⚠️ Only vexa is available"
}
```

---

## 2. Bot Management

### 2.1 Tạo Bot (với Fallback)

Tạo bot để tham gia cuộc họp. Hệ thống sẽ thử New Bot trước, nếu thất bại sẽ dùng Vexa.

```http
POST /api/bots
Content-Type: application/json
```

**Request Body**
```json
{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "meetUrl": "https://meet.google.com/abc-defg-hij",
  "language": "vi",
  "botName": "Note Pro Meeting Bot",
  "duration": 60
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform` | string | ❌ | Platform: `google_meet`, `teams`, `zoom`. Mặc định: `google_meet` |
| `native_meeting_id` | string | ⚡ | Meeting ID (có thể trích từ meetUrl) |
| `meetUrl` | string | ⚡ | Full URL của cuộc họp |
| `language` | string | ❌ | Ngôn ngữ transcript. Mặc định: `vi` |
| `botName` | string | ❌ | Tên hiển thị của bot |
| `bot_name` | string | ❌ | Alias của botName (cho Vexa) |
| `duration` | number | ❌ | Thời gian chạy (phút) - chỉ cho New Bot |
| `passcode` | string | ❌ | Passcode (chỉ cho Teams) |

> ⚡ Cần ít nhất một trong hai: `native_meeting_id` hoặc `meetUrl`

**Response (201 Created) - New Bot**
```json
{
  "success": true,
  "status": "initializing",
  "sessionId": "aBcDeF12",
  "meetingId": "abc-defg-hij",
  "outputFile": "C:\\...\\data\\captions_abc-defg-hij_2026-01-28.ndjson",
  "duration": 60,
  "botName": "Note Pro Meeting Bot",
  "language": "vi",
  "provider": "new_bot",
  "meetingCode": "abc-defg-hij",
  "message": "✅ Bot created using New Bot service"
}
```

**Response (201 Created) - Vexa Fallback**
```json
{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "joining",
  "provider": "vexa",
  "meetingCode": "abc-defg-hij",
  "message": "✅ Bot created using Vexa service (fallback)"
}
```

**Response (500 Error)**
```json
{
  "success": false,
  "error": "Both bot providers failed",
  "details": "Connection refused"
}
```

---

### 2.2 Tạo Bot (Chỉ Vexa - Legacy)

```http
POST /api/bots
Content-Type: application/json
X-API-Key: YOUR_VEXA_API_KEY
```

> ⚠️ Endpoint này dùng cho backward compatibility. Khuyến nghị dùng `/api/bots` (với fallback).

**Request Body**
```json
{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "language": "vi",
  "bot_name": "Note Pro Meeting Bot"
}
```

---

### 2.3 Lấy Trạng Thái Bot

```http
GET /api/bots/status
```

**Response (200 OK)**
```json
{
  "newBot": {
    "available": true,
    "sessions": [
      {
        "sessionId": "aBcDeF12",
        "meetingId": "abc-defg-hij",
        "startTime": "2026-01-28T10:30:45.123Z",
        "duration": 60,
        "isActive": true,
        "uptime": 3665
      }
    ],
    "total": 1
  },
  "vexa": {
    "available": true,
    "data": [...]
  }
}
```

---

### 2.4 Dừng Bot

```http
DELETE /api/bots/:platform/:code
```

**Path Parameters**
| Parameter | Description |
|-----------|-------------|
| `platform` | `google_meet`, `teams`, `zoom` |
| `code` | Meeting code (e.g., `abc-defg-hij`) |

**Query Parameters (Optional)**
| Parameter | Description |
|-----------|-------------|
| `sessionId` | Session ID từ New Bot (để dừng chính xác session) |

**Example**
```http
DELETE /api/bots/google_meet/abc-defg-hij?sessionId=aBcDeF12
```

**Response (200 OK)**
```json
{
  "success": true,
  "sessionId": "aBcDeF12",
  "provider": "new_bot",
  "message": "✅ Bot stopped using new_bot service"
}
```

---

## 3. Transcript Management

### 3.1 Lấy Transcript (với Fallback)

Lấy transcript của cuộc họp. Thử New Bot trước, fallback sang Vexa nếu thất bại.

```http
GET /api/transcripts/:platform/:code
```

**Path Parameters**
| Parameter | Description |
|-----------|-------------|
| `platform` | `google_meet`, `teams`, `zoom` |
| `code` | Meeting code (e.g., `abc-defg-hij`) |

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `offset` | number | 0 | Vị trí bắt đầu |
| `limit` | number | 500 | Số lượng bản ghi tối đa |
| `date` | string | - | Lọc theo ngày (YYYY-MM-DD) |

**Example**
```http
GET /api/transcripts/google_meet/abc-defg-hij?offset=0&limit=100
```

**Response (200 OK)**
```json
{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "active",
  "start_time": "2026-01-28T10:30:45.123Z",
  "end_time": null,
  "segments": [
    {
      "id": "0",
      "speaker": "Nguyễn Văn A",
      "text": "Xin chào mọi người",
      "start": 0.0,
      "end": 2.5,
      "language": "vi",
      "created_at": "2026-01-28T10:30:45.123Z"
    },
    {
      "id": "1",
      "speaker": "Trần Thị B",
      "text": "Chào bạn, bắt đầu cuộc họp nhé",
      "start": 3.0,
      "end": 5.5,
      "language": "vi",
      "created_at": "2026-01-28T10:30:48.456Z"
    }
  ],
  "total": 2,
  "provider": "new_bot"
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "error": "Both providers failed to get transcript",
  "details": {
    "newBot": "Không tìm thấy caption cho meeting này",
    "vexa": "Meeting not found"
  },
  "meetingId": "abc-defg-hij"
}
```

---

### 3.2 Ingest Transcript (Từ Extension)

Nhận và lưu transcript từ Chrome Extension vào database.

```http
POST /ingest
Content-Type: application/json
```

**Request Body**
```json
{
  "meetId": "abc-defg-hij",
  "at": "2026-01-28T10:30:45.123Z",
  "item": {
    "speaker": "Nguyễn Văn A",
    "text": "Xin chào mọi người"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meetId` | string | ✅ | Meeting ID |
| `at` | string | ❌ | Timestamp (ISO 8601). Mặc định: now |
| `item` | object | ✅ | Transcript item |
| `item.speaker` | string | ❌ | Tên người nói |
| `item.text` | string | ✅ | Nội dung transcript |

**Response (200 OK)**
```json
{
  "ok": true,
  "meetId": "abc-defg-hij",
  "savedAt": "2026-01-28T10:30:45.123Z"
}
```

---

### 3.3 Lấy Transcript Mới Nhất

```http
GET /latest/:meetId
```

**Response (200 OK)**
```json
{
  "id": 123,
  "meet_id": "abc-defg-hij",
  "speaker": "Nguyễn Văn A",
  "text": "Cảm ơn mọi người đã tham gia",
  "recorded_at": "2026-01-28T11:30:00.000Z",
  "created_at": "2026-01-28T11:30:00.123Z"
}
```

---

### 3.4 Lấy Script Đã Format

```http
GET /script/:meetId
```

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `txt` | Format: `txt`, `md`, `json`, `srt`, `vtt` |

**Example**
```http
GET /script/abc-defg-hij?format=md
```

**Response (200 OK) - format=txt**
```
[10:30:45] Nguyễn Văn A: Xin chào mọi người
[10:30:48] Trần Thị B: Chào bạn, bắt đầu cuộc họp nhé
[10:31:00] Nguyễn Văn A: Hôm nay chúng ta sẽ thảo luận về...
```

**Response (200 OK) - format=md**
```markdown
# Transcript: abc-defg-hij

## 10:30:45
**Nguyễn Văn A:** Xin chào mọi người

## 10:30:48
**Trần Thị B:** Chào bạn, bắt đầu cuộc họp nhé

## 10:31:00
**Nguyễn Văn A:** Hôm nay chúng ta sẽ thảo luận về...
```

**Response (200 OK) - format=json**
```json
{
  "meetId": "abc-defg-hij",
  "transcripts": [
    {
      "speaker": "Nguyễn Văn A",
      "text": "Xin chào mọi người",
      "timestamp": "2026-01-28T10:30:45.123Z"
    }
  ],
  "total": 1
}
```

**Response (200 OK) - format=srt**
```
1
00:00:00,000 --> 00:00:02,500
[Nguyễn Văn A] Xin chào mọi người

2
00:00:03,000 --> 00:00:05,500
[Trần Thị B] Chào bạn, bắt đầu cuộc họp nhé
```

---

### 3.5 Lấy Extension Script

```http
GET /extension_script/:meetId
```

**Response (200 OK)**
```json
{
  "meetId": "abc-defg-hij",
  "items": [
    {
      "at": "2026-01-28T10:30:45.123Z",
      "speaker": "Nguyễn Văn A",
      "text": "Xin chào mọi người"
    }
  ],
  "count": 1
}
```

---

### 3.6 Lấy Tất Cả Transcript (Với Pagination)

```http
GET /transcripts/:meetId
```

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 100 | Số lượng bản ghi tối đa |
| `offset` | number | 0 | Vị trí bắt đầu |

**Response (200 OK)**
```json
{
  "meetId": "abc-defg-hij",
  "transcripts": [
    {
      "id": 1,
      "speaker": "Nguyễn Văn A",
      "text": "Xin chào mọi người",
      "recorded_at": "2026-01-28T10:30:45.123Z"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

---

### 3.7 Lấy Statistics

```http
GET /transcripts/:meetId/stats
```

**Response (200 OK)**
```json
{
  "meetId": "abc-defg-hij",
  "stats": {
    "totalTranscripts": 150,
    "speakers": ["Nguyễn Văn A", "Trần Thị B"],
    "speakerCount": 2,
    "startTime": "2026-01-28T10:30:00.000Z",
    "endTime": "2026-01-28T11:30:00.000Z",
    "duration": 3600
  }
}
```

---

### 3.8 Tìm Kiếm Transcript

```http
GET /transcripts/:meetId/search
```

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ | Từ khóa tìm kiếm |
| `limit` | number | ❌ | Số kết quả tối đa (mặc định: 50) |

**Example**
```http
GET /transcripts/abc-defg-hij/search?q=deadline&limit=10
```

**Response (200 OK)**
```json
{
  "meetId": "abc-defg-hij",
  "query": "deadline",
  "results": [
    {
      "id": 45,
      "speaker": "Nguyễn Văn A",
      "text": "Deadline của dự án là ngày 15",
      "recorded_at": "2026-01-28T10:45:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 3.9 Migrate File to Database

Chuyển transcript từ file text sang database.

```http
POST /transcripts/:meetId/migrate
```

**Response (200 OK)**
```json
{
  "success": true,
  "meetId": "abc-defg-hij",
  "migrated": 150,
  "message": "Successfully migrated 150 transcripts"
}
```

---

### 3.10 Xóa Transcript

```http
DELETE /transcripts/:meetId
```

**Response (200 OK)**
```json
{
  "success": true,
  "meetId": "abc-defg-hij",
  "deleted": 150
}
```

---

## 4. Meeting Management

### 4.1 Lấy Danh Sách Meetings

```http
GET /api/meetings
```

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Số lượng tối đa |
| `offset` | number | 0 | Vị trí bắt đầu |
| `status` | string | - | Filter: `active`, `ended` |

**Response (200 OK)**
```json
{
  "meetings": [
    {
      "id": 1,
      "meet_id": "abc-defg-hij",
      "title": "Team Standup",
      "platform": "google_meet",
      "started_at": "2026-01-28T10:30:00.000Z",
      "ended_at": null,
      "status": "active",
      "participants": ["Nguyễn Văn A", "Trần Thị B"]
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### 4.2 Lấy Chi Tiết Meeting

```http
GET /api/meetings/:meetId
```

**Response (200 OK)**
```json
{
  "id": 1,
  "meet_id": "abc-defg-hij",
  "title": "Team Standup",
  "platform": "google_meet",
  "started_at": "2026-01-28T10:30:00.000Z",
  "ended_at": "2026-01-28T11:30:00.000Z",
  "status": "ended",
  "participants": ["Nguyễn Văn A", "Trần Thị B"],
  "analysis": {
    "summary": "Cuộc họp thảo luận về tiến độ dự án...",
    "keyPoints": [...]
  },
  "metadata": {}
}
```

---

### 4.3 Tạo Meeting

```http
POST /api/meetings
Content-Type: application/json
```

**Request Body**
```json
{
  "meetId": "abc-defg-hij",
  "title": "Team Standup",
  "platform": "google_meet",
  "participants": ["Nguyễn Văn A", "Trần Thị B"]
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "meet_id": "abc-defg-hij",
  "title": "Team Standup",
  "platform": "google_meet",
  "status": "active",
  "started_at": "2026-01-28T10:30:00.000Z"
}
```

---

### 4.4 Cập Nhật Status Meeting

```http
PATCH /api/meetings/:meetId/status
Content-Type: application/json
```

**Request Body**
```json
{
  "status": "ended"
}
```

**Response (200 OK)**
```json
{
  "id": 1,
  "meet_id": "abc-defg-hij",
  "status": "ended",
  "ended_at": "2026-01-28T11:30:00.000Z"
}
```

---

### 4.5 Xóa Meeting

```http
DELETE /api/meetings/:meetId
```

**Response (200 OK)**
```json
{
  "success": true,
  "meetId": "abc-defg-hij",
  "deleted": true
}
```

---

## 5. OpenAI Analysis

### 5.1 Phân Tích Transcript

Phân tích transcript bằng OpenAI để tạo tóm tắt, key points, action items. **Kết quả được lưu vào database**.

```http
POST /analyze
Content-Type: application/json
```

**Request Body**
```json
{
  "text": "Nội dung cuộc họp cần phân tích...",
  "meetId": "abc-defg-hij",
  "locale": "vi",
  "maxHighlights": 8,
  "maxTodos": 10,
  "saveToDb": true,
  "segments": [
    {
      "speaker": "Nguyễn Văn A",
      "text": "Xin chào mọi người",
      "start": 0,
      "end": 2.5
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | ✅ | Nội dung cần phân tích (min 8 ký tự) |
| `meetId` | string | ❌ | Meeting ID để lưu kết quả vào DB |
| `locale` | string | ❌ | Ngôn ngữ output: `vi`, `en`. Mặc định: `vi` |
| `maxHighlights` | number | ❌ | Số highlights tối đa (3-15). Mặc định: 8 |
| `maxTodos` | number | ❌ | Số todos tối đa (3-20). Mặc định: 10 |
| `saveToDb` | boolean | ❌ | Lưu vào database. Mặc định: `true` |
| `segments` | array | ❌ | Transcript segments với speaker, text, start, end |

**Response (200 OK)**
```json
{
  "summary": "Cuộc họp team standup hàng ngày thảo luận về tiến độ dự án XYZ...",
  "highlights": [
    "Dự án đang đúng tiến độ",
    "Cần hoàn thành module A trước ngày 15",
    "Team cần thêm 1 developer"
  ],
  "todos": [
    {
      "task": "Hoàn thành module A",
      "rationale": "Để đảm bảo tiến độ dự án",
      "priority": "high",
      "due": "15/02/2026",
      "owner_hint": "Nguyễn Văn A"
    },
    {
      "task": "Tuyển thêm developer",
      "rationale": "Team đang thiếu nhân lực",
      "priority": "medium",
      "due": "Cuối tháng",
      "owner_hint": "HR Team"
    }
  ],
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 567,
    "total_tokens": 1801
  },
  "analysisId": 42,
  "meetId": "abc-defg-hij",
  "processingTimeMs": 3456,
  "savedToDb": true
}
```

> 💡 **Lưu ý:** Khi `meetId` được cung cấp, kết quả phân tích tự động được lưu vào bảng `analyses` và cập nhật field `analysis` trong bảng `meetings`.

---

### 5.2 Chat với Context

Chat với AI dựa trên context của phân tích trước đó. Lịch sử chat được lưu vào database.

#### Legacy: POST /chat
```http
POST /chat
Content-Type: application/json
```

**Request Body (legacy)**
```json
{
  "summary": "Cuộc họp thảo luận về tiến độ dự án...",
  "highlights": ["Dự án đúng tiến độ", "Cần thêm developer"],
  "todos": [
    {
      "task": "Hoàn thành module A",
      "priority": "high"
    }
  ],
  "message": "Ai được giao task hoàn thành module A?",
  "analysisId": 42,
  "meetId": "abc-defg-hij"
}
```

#### New: POST /chat/transcript (preferred for transcript-only backends)
```http
POST /chat/transcript
Content-Type: application/json
```

**Request Body (preferred)**
```json
{
  "message": "có bao nhiêu người tham gia, nêu rõ họ tên của họ",
  "transcripts": [
    { "speaker": "Nguyễn Quang Huy", "text": "Quyết định: tăng ngân sách Q2", "at": "2025-12-01T10:00:00Z" },
    { "speaker": "Bảo", "text": "Minh sẽ theo dõi tiến độ", "at": "2025-12-01T10:01:00Z" }
  ],
  "meetId": "optional-meet-id"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ | Câu hỏi hoặc prompt của user |
| `transcripts` | array | ✅ | Mảng các câu thoại: `speaker`, `text`, `at` (ISO-8601) |
| `meetId` | string | ❌ | Meeting ID (optional, để đồng bộ lịch sử)

**Response (200 OK)**
```json
{
  "reply": "Có 2 người tham gia: Nguyễn Quang Huy, Bảo.",
  "matched_participants": ["Nguyễn Quang Huy","Bảo"]
}
```

---

### 5.3 Lấy Danh Sách Analysis của Meeting

```http
GET /api/analyses/:meetId
```

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Số lượng tối đa |
| `offset` | number | 0 | Vị trí bắt đầu |

**Response (200 OK)**
```json
{
  "meetId": "abc-defg-hij",
  "analyses": [
    {
      "id": 42,
      "meet_id": "abc-defg-hij",
      "analysis_type": "meeting_summary",
      "summary": "Cuộc họp thảo luận về tiến độ dự án...",
      "highlights": ["Dự án đúng tiến độ", "Cần thêm developer"],
      "todos": [
        {
          "task": "Hoàn thành module A",
          "priority": "high"
        }
      ],
      "locale": "vi",
      "model": "gpt-4o",
      "tokens_used": 1801,
      "processing_time_ms": 3456,
      "chat_history": [
        {
          "role": "user",
          "content": "Ai được giao task?",
          "timestamp": "2026-01-28T11:00:00.000Z"
        },
        {
          "role": "assistant",
          "content": "Nguyễn Văn A được giao...",
          "timestamp": "2026-01-28T11:00:02.000Z"
        }
      ],
      "created_at": "2026-01-28T10:30:00.000Z",
      "updated_at": "2026-01-28T11:00:02.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### 5.4 Lấy Analysis Mới Nhất của Meeting

```http
GET /api/analyses/:meetId/latest
```

**Response (200 OK)**
```json
{
  "id": 42,
  "meet_id": "abc-defg-hij",
  "analysis_type": "meeting_summary",
  "summary": "Cuộc họp thảo luận về tiến độ dự án...",
  "highlights": ["Dự án đúng tiến độ", "Cần thêm developer"],
  "todos": [...],
  "locale": "vi",
  "model": "gpt-4o",
  "tokens_used": 1801,
  "processing_time_ms": 3456,
  "chat_history": [...],
  "created_at": "2026-01-28T10:30:00.000Z"
}
```

**Response (404 Not Found)**
```json
{
  "error": "No analysis found for this meeting",
  "meetId": "abc-defg-hij"
}
```

---

### 5.5 Lấy Statistics của Analysis

```http
GET /api/analyses/stats
```

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meetId` | string | ❌ | Filter theo meeting ID |

**Response (200 OK)**
```json
{
  "meetId": "all",
  "stats": {
    "total": "150",
    "total_tokens": "270180",
    "avg_processing_time": "3456.78",
    "first_analysis": "2026-01-01T10:00:00.000Z",
    "last_analysis": "2026-01-28T10:30:00.000Z"
  }
}
```

---

### 5.6 Xóa Analysis

```http
DELETE /api/analyses/:id
```

**Path Parameters**
| Parameter | Description |
|-----------|-------------|
| `id` | Analysis ID (số) |

**Response (200 OK)**
```json
{
  "success": true,
  "id": 42,
  "deleted": true
}
```

**Response (404 Not Found)**
```json
{
  "error": "Analysis not found",
  "id": "42"
}
```

---


## 6. URL Management

### 6.1 Lưu URL (GET - Legacy)

```http
GET /api/urls?url=https://example.com&name_server=Server1
```

**Response (200 OK)**
```json
{
  "success": true,
  "id": 1,
  "url": "https://example.com",
  "name_server": "Server1"
}
```

---

### 6.2 Tạo URL (POST)

```http
POST /api/urls
Content-Type: application/json
```

**Request Body**
```json
{
  "url": "https://example.com",
  "name_server": "Server1"
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "url": "https://example.com",
  "name_server": "Server1",
  "is_active": true,
  "created_at": "2026-01-28T10:30:00.000Z"
}
```

---

### 6.3 Lấy Danh Sách URLs

```http
GET /api/urls/list
```

**Response (200 OK)**
```json
{
  "urls": [
    {
      "id": 1,
      "url": "https://example.com",
      "name_server": "Server1",
      "is_active": true
    }
  ],
  "total": 1
}
```

---

### 6.4 Lấy Name Servers

```http
GET /api/urls/name-servers
```

**Response (200 OK)**
```json
{
  "nameServers": ["Server1", "Server2", "Production"]
}
```

---

### 6.5 Health Check URLs

```http
POST /api/urls/health-check
Content-Type: application/json
```

**Request Body**
```json
{
  "urls": ["https://example.com", "https://api.example.com"]
}
```

**Response (200 OK)**
```json
{
  "results": [
    {
      "url": "https://example.com",
      "status": "healthy",
      "responseTime": 245,
      "statusCode": 200
    },
    {
      "url": "https://api.example.com",
      "status": "unhealthy",
      "error": "Connection timeout"
    }
  ]
}
```

---

### 6.6 Cập Nhật URL

```http
PUT /api/urls/:id
Content-Type: application/json
```

**Request Body**
```json
{
  "url": "https://new-url.com",
  "name_server": "NewServer",
  "is_active": false
}
```

**Response (200 OK)**
```json
{
  "id": 1,
  "url": "https://new-url.com",
  "name_server": "NewServer",
  "is_active": false,
  "updated_at": "2026-01-28T11:00:00.000Z"
}
```

---

### 6.7 Xóa URL

```http
DELETE /api/urls/:id
```

**Response (200 OK)**
```json
{
  "success": true,
  "id": 1,
  "deleted": true
}
```

---

## 7. File Management

### 7.1 Lấy Danh Sách Files

Lấy danh sách các file transcript trong thư mục `data`.

```http
GET /api/files
```

**Response (200 OK)**
```json
{
  "files": [
    {
      "filename": "abc-defg-hij.txt",
      "meetId": "abc-defg-hij",
      "size": 15240,
      "created": "2026-01-28T10:30:00.000Z",
      "modified": "2026-01-28T11:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 7.2 Xóa File

```http
DELETE /api/files/:meetId
```

**Response (200 OK)**
```json
{
  "success": true,
  "meetId": "abc-defg-hij",
  "deleted": true
}
```

**Response (404 Not Found)**
```json
{
  "success": false,
  "error": "File not found",
  "meetId": "abc-defg-hij"
}
```

---

## 8. Socket.IO Events

### 8.1 Kết nối

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

---

### 8.2 Client → Server Events

#### Join Vexa Transcript Room

```javascript
socket.emit('join', {
  platform: 'google_meet',
  code: 'abc-defg-hij'
});
```

#### Leave Vexa Transcript Room

```javascript
socket.emit('leave', {
  platform: 'google_meet', 
  code: 'abc-defg-hij'
});
```

#### Join Meeting Room (Extension/Frontend)

```javascript
socket.emit('meet:join', {
  meetId: 'abc-defg-hij'
});
```

#### Leave Meeting Room

```javascript
socket.emit('meet:leave', {
  meetId: 'abc-defg-hij'
});
```

---

### 8.3 Server → Client Events

#### Transcript Mới (Vexa)

```javascript
socket.on('transcript:new', (segments) => {
  console.log('New segments:', segments);
  // segments: Array of transcript segments from Vexa
});
```

#### Transcript Error (Vexa)

```javascript
socket.on('transcript:error', (message) => {
  console.error('Vexa error:', message);
});
```

#### Transcript Mới (Ingest)

```javascript
socket.on('ingest:new', (data) => {
  console.log('New ingest:', data);
  // { meetId, at, speaker, text }
});
```

#### Full Transcripts (On Join)

```javascript
socket.on('ingest:full', (data) => {
  console.log('Full transcripts:', data);
  // { meetId, items: [...] }
});
```

#### Ingest Error

```javascript
socket.on('ingest:error', (data) => {
  console.error('Ingest error:', data);
  // { meetId, error }
});
```

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Thiếu hoặc sai parameter |
| 404 | Not Found - Resource không tồn tại |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## 🔧 Rate Limiting

- **Window:** 1 phút
- **Max requests:** 20 requests/phút (cho `/analyze` và `/chat`)

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Server logs
2. Health check endpoints
3. Database connection

---

**Cập nhật lần cuối:** 28/01/2026
