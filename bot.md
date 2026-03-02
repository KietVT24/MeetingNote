# 📖 Hướng Dẫn API - Google Meet Bot

API server để quản lý bot Google Meet và lấy phụ đề (captions) từ các cuộc họp.

---

## 🚀 Khởi động Server

```bash
node api-server.js
```

Server sẽ chạy tại: **http://localhost:1010**

### Các biến môi trường (Environment Variables):
```bash
PORT=1010                    # Port của API (mặc định: 1010)
LOCALE=vi-VN               # Ngôn ngữ mặc định (mặc định: vi-VN)
DURATION_MIN=60             # Thời gian chạy mặc định (phút)
CDP_HOST=127.0.0.1         # Host Chrome DevTools Protocol
CDP_PORT=9222              # Port CDP
USER_DATA_DIR=C:\ChromeBotUI # Thư mục lưu profile
DATA_DIR=./data             # Thư mục lưu captions
```

---

## ✅ Health Check

Kiểm tra server có chạy không.

### Request
```http
GET /health
```

### Response (200 OK)
```json
{
  "status": "OK",
  "timestamp": "2026-01-28T10:30:45.123Z"
}
```

---

## 🤖 Khởi động Bot - Tham gia Google Meet

Tạo một bot mới để tham gia cuộc họp Google Meet và thu thập phụ đề.

### Request
```http
POST /bots
Content-Type: application/json

{
  "meetUrl": "https://meet.google.com/abc-defg-hij",
  "duration": 60,
  "native_meeting_id": "abc-defg-hij",
  "botName": "My Bot User",
  "language": "vi"
}
```

### Parameters (Body)

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `meetUrl` | String | ✅ Có | URL của cuộc họp Google Meet |
| `duration` | Number | ❌ Không | Thời gian bot chạy (phút). Mặc định: 180 |
| `native_meeting_id` | String | ❌ Không | ID của cuộc họp (nếu không có, sẽ tự trích từ URL) |
| `botName` | String | ❌ Không | Tên hiển thị của bot. Mặc định: Bot-{sessionId} |
| `language` | String | ❌ Không | Ngôn ngữ cho phụ đề. Mặc định: "vi" |

### Supported Languages (ngôn ngữ được hỗ trợ)
```
vi    - Tiếng Việt
en    - English
zh    - 中文 (Chinese)
ja    - 日本語 (Japanese)
ko    - 한국어 (Korean)
fr    - Français (French)
de    - Deutsch (German)
es    - Español (Spanish)
it    - Italiano (Italian)
pt    - Português (Portuguese)
ru    - Русский (Russian)
ar    - العربية (Arabic)
hi    - हिन्दी (Hindi)
th    - ไทย (Thai)
id    - Bahasa Indonesia
ms    - Bahasa Melayu
```

### Response (200 OK)
```json
{
  "success": true,
  "status": "initializing",
  "sessionId": "aBcDeF12",
  "meetingId": "abc-defg-hij",
  "outputFile": "C:\\Users\\...\\data\\captions_abc-defg-hij_2026-01-28.ndjson",
  "duration": 60,
  "botName": "My Bot User",
  "language": "vi",
  "message": "Đã nhận yêu cầu. Đang khởi tạo bot ở background (mỗi meeting 1 Chrome)."
}
```

### Response (200 OK - Invalid URL)
```json
{
  "success": false,
  "status": "invalid_url",
  "error": "URL không hợp lệ. Phải là Google Meet URL",
  "example": {
    "meetUrl": "https://meet.google.com/abc-defg-hij",
    "duration": 60,
    "botName": "Bot User",
    "language": "vi"
  }
}
```

---

## 📋 Lấy Danh Sách File Phụ Đề

Lấy danh sách tất cả các file phụ đề đã tạo.

### Request
```http
GET /captions
```

### Response (200 OK)
```json
{
  "files": [
    {
      "filename": "captions_abc-defg-hij_2026-01-28.ndjson",
      "size": 45620,
      "created": "2026-01-28T10:30:45.123Z",
      "modified": "2026-01-28T11:35:20.456Z"
    },
    {
      "filename": "captions_xyz-uvwx-rst_2026-01-27.ndjson",
      "size": 32150,
      "created": "2026-01-27T14:20:10.789Z",
      "modified": "2026-01-27T15:45:30.012Z"
    }
  ]
}
```

---

## 📖 Lấy Nội Dung File Phụ Đề (Theo Tên File)

Đọc chi tiết nội dung của một file phụ đề cụ thể.

### Request
```http
GET /captions/captions_abc-defg-hij_2026-01-28.ndjson
```

### Response (200 OK)
```json
{
  "filename": "captions_abc-defg-hij_2026-01-28.ndjson",
  "totalLines": 145,
  "captions": [
    {
      "meeting_id": "abc-defg-hij",
      "ts": "2026-01-28T10:30:45.123Z",
      "src": "poll",
      "speaker": "Nguyễn Văn A",
      "text": "Xin chào tất cả mọi người"
    },
    {
      "meeting_id": "abc-defg-hij",
      "ts": "2026-01-28T10:31:12.456Z",
      "src": "poll",
      "speaker": "Trần Thị B",
      "text": "Cảm ơn bạn đã tham gia cuộc họp"
    }
  ]
}
```

### Response (404 Not Found)
```json
{
  "error": "File không tồn tại"
}
```

---

## 🎯 Lấy Phụ Đề Theo Meeting ID (Recommended)

Lấy phụ đề của một cuộc họp cụ thể với các tùy chọn phân trang.

### Request
```http
GET /transcripts/google_meet/abc-defg-hij?offset=0&limit=500&date=2026-01-28
```

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `meetingId` | String | ✅ Có | ID của cuộc họp (từ URL: `meet.google.com/{meetingId}`) |
| `offset` | Number | ❌ Không | Vị trí bắt đầu lấy dữ liệu (mặc định: 0) |
| `limit` | Number | ❌ Không | Số lượng bản ghi trả về (mặc định: 500, tối đa: 5000) |
| `date` | String | ❌ Không | Lọc theo ngày (format: YYYY-MM-DD). Nếu có nhiều file cùng meetingId, sẽ ưu tiên file của ngày này |

### Response (200 OK)
```json
{
  "id": 1234567890,
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "constructed_meeting_url": "https://meet.google.com/abc-defg-hij",
  "status": "completed",
  "start_time": "2026-01-28T10:30:45.123Z",
  "end_time": "2026-01-28T11:35:20.456Z",
  "segments": [
    {
      "start": 0.0,
      "end": 1.0,
      "text": "Xin chào tất cả mọi người",
      "language": "vi",
      "created_at": "2026-01-28T10:30:45.123Z",
      "speaker": "Nguyễn Văn A",
      "absolute_start_time": "2026-01-28T10:30:45.123Z",
      "absolute_end_time": "2026-01-28T10:30:46.123Z"
    },
    {
      "start": 27.333,
      "end": 28.333,
      "text": "Cảm ơn bạn đã tham gia cuộc họp",
      "language": "vi",
      "created_at": "2026-01-28T10:31:12.456Z",
      "speaker": "Trần Thị B",
      "absolute_start_time": "2026-01-28T10:31:12.456Z",
      "absolute_end_time": "2026-01-28T10:31:13.456Z"
    }
  ],
  "file": "captions_abc-defg-hij_2026-01-28.ndjson",
  "total_lines": 145,
  "returned": 100,
  "offset": 0,
  "limit": 500
}
```

### Response (404 Not Found)
```json
{
  "error": "Không tìm thấy caption cho meeting này",
  "meetingId": "abc-defg-hij",
  "suggestion": "Kiểm tra lại meeting ID hoặc đảm bảo bot đã chạy"
}
```

---

## 📊 Lấy Danh Sách Sessions Đang Chạy

Xem tất cả các bot sessions hiện đang hoạt động.

### Request
```http
GET /sessions
```

### Response (200 OK)
```json
{
  "total": 2,
  "sessions": [
    {
      "sessionId": "aBcDeF12",
      "meetingId": "abc-defg-hij",
      "startTime": "2026-01-28T10:30:45.123Z",
      "duration": 60,
      "isActive": true,
      "uptime": 3665
    },
    {
      "sessionId": "XyZ9876",
      "meetingId": "xyz-uvwx-rst",
      "startTime": "2026-01-28T10:15:20.456Z",
      "duration": 120,
      "isActive": true,
      "uptime": 5070
    }
  ]
}
```

---

## 🛑 Dừng Bot Session

Dừng một bot session cụ thể và giải phóng tài nguyên.

### Request
```http
POST /stop-bot/aBcDeF12
Content-Type: application/json
```

### Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `sessionId` | String | ✅ Có | ID của session cần dừng (từ response của `/bots` hoặc `/sessions`) |

### Response (200 OK)
```json
{
  "success": true,
  "sessionId": "aBcDeF12",
  "message": "Bot đã được dừng thành công"
}
```

### Response (404 Not Found)
```json
{
  "success": false,
  "sessionId": "aBcDeF12",
  "error": "Session không tồn tại hoặc đã được dừng"
}
```

---

## 🛑 Dừng Tất Cả Bot Sessions

Dừng toàn bộ các bot sessions đang chạy.

### Request
```http
POST /stop-all-bots
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "success": true,
  "totalSessions": 2,
  "stoppedSessions": 2,
  "results": [
    {
      "sessionId": "aBcDeF12",
      "success": true
    },
    {
      "sessionId": "XyZ9876",
      "success": true
    }
  ],
  "message": "Đã dừng 2/2 bot sessions"
}
```

---

## 📝 Ví Dụ Sử Dụng (Examples)

### Ví dụ 1: Khởi động bot với cURL

```bash
curl -X POST http://localhost:1010/bots \
  -H "Content-Type: application/json" \
  -d '{
    "meetUrl": "https://meet.google.com/abc-defg-hij",
    "duration": 30,
    "botName": "Recording Bot",
    "language": "vi"
  }'
```

### Ví dụ 2: Lấy phụ đề với Node.js/JavaScript

```javascript
const axios = require('axios');

async function getCaptions(meetingId) {
  try {
    const response = await axios.get(
      `http://localhost:1010/transcripts/google_meet/${meetingId}`,
      { params: { offset: 0, limit: 1000 } }
    );
    
    console.log(`Meeting: ${response.data.native_meeting_id}`);
    console.log(`Status: ${response.data.status}`);
    console.log(`Captions: ${response.data.segments.length}`);
    
    response.data.segments.forEach(seg => {
      console.log(`[${seg.speaker || 'Unknown'}] ${seg.text}`);
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getCaptions('abc-defg-hij');
```

### Ví dụ 3: Lấy danh sách sessions với Python

```python
import requests

response = requests.get('http://localhost:1010/sessions')
data = response.json()

for session in data['sessions']:
    print(f"Session: {session['sessionId']}")
    print(f"  Meeting ID: {session['meetingId']}")
    print(f"  Active: {session['isActive']}")
    print(f"  Uptime: {session['uptime']}s")
    print()
```

### Ví dụ 4: Dừng session với cURL

```bash
curl -X POST http://localhost:1010/stop-bot/aBcDeF12 \
  -H "Content-Type: application/json"
```

---

## 📊 Cấu Trúc Dữ Liệu NDJSON

Phụ đề được lưu dưới định dạng **NDJSON** (Newline Delimited JSON). Mỗi dòng là một JSON object độc lập.

### Cấu trúc mỗi dòng (record)

```json
{
  "meeting_id": "abc-defg-hij",
  "ts": "2026-01-28T10:30:45.123Z",
  "src": "poll",
  "speaker": "Nguyễn Văn A",
  "text": "Xin chào tất cả mọi người"
}
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `meeting_id` | String | ID của cuộc họp Google Meet |
| `ts` | String (ISO 8601) | Thời gian ghi phụ đề |
| `src` | String | Nguồn: "snapshot" (lần đầu) hoặc "poll" (polling) |
| `speaker` | String \| null | Tên người nói (nếu có, nếu không là `null`) |
| `text` | String | Nội dung phụ đề |

---

## ⚠️ Mã Lỗi (Error Codes)

| Mã HTTP | Mô tả | Khi nào xảy ra |
|---------|-------|----------------|
| **200** | OK | Yêu cầu thành công |
| **400** | Bad Request | Thiếu tham số bắt buộc hoặc tham số không hợp lệ |
| **404** | Not Found | Session không tồn tại, file không tìm thấy |
| **500** | Internal Server Error | Lỗi server (kiểm tra logs) |

---

## 🔒 Lưu Ý Bảo Mật

- API hiện không có xác thực (authentication). Nếu deploy công khai, hãy thêm authentication.
- Không share `sessionId` công khai.
- Phụ đề chứa nội dung của cuộc họp → cần bảo vệ theo yêu cầu bảo mật của tổ chức.

---

## 🐛 Troubleshooting

### Server không chạy
```bash
# Kiểm tra port 1010 có bị chiếm không
netstat -ano | findstr :1010

# Thử port khác
PORT=3000 node api-server.js
```

### Bot không tham gia được meeting
- Kiểm tra URL có đúng không: `https://meet.google.com/XXX-XXXX-XXX`
- Kiểm tra Chrome/Edge đã cài đặt
- Nếu meeting có yêu cầu xác thực, bot cần tài khoản Google

### Phụ đề không xuất hiện
- Kiểm tra phụ đề đã bật trên meeting không (`Cc` hoặc `Captions`)
- Kiểm tra ngôn ngữ phụ đề có khớp không
- Xem logs của server để tìm lỗi

### File phụ đề rỗng hoặc không đầy đủ
- Bot có thể bị timeout hoặc ngắt kết nối
- Kiểm tra `duration` có đủ dài không
- Xem file log để tìm lỗi

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs của server (console output)
2. File `package.json` để đảm bảo dependencies đã cài đặt
3. README.md của dự án

---

**Cập nhật lần cuối:** 28/01/2026
