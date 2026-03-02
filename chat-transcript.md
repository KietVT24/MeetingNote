# 💬 Hướng Dẫn Sử Dụng API Chat Transcript

API `/chat/transcript` cho phép người dùng chat trực tiếp với nội dung của cuộc họp (transcript data) mà không cần phải chạy phân tích tổng thể trước đó. Hệ thống sẽ sử dụng transcript làm ngữ cảnh (context) để trả lời các câu hỏi của người dùng.

## Endpoint

- **URL:** `/chat/transcript`
- **Method:** `POST`
- **Content-Type:** `application/json`

---

## 1. Request Body

Có 2 cách để gọi API này: truyền `meetId` (để lấy transcript từ database) HOẶC truyền trực tiếp mảng `transcripts`.

### Các trường dữ liệu (Fields)

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `message` | `string` | ✅ Có | Câu hỏi hoặc yêu cầu của người dùng. |
| `meetId` | `string` | ⚡ Conditional | ID của cuộc họp. Nếu cung cấp, hệ thống sẽ tự động lấy transcript từ database. |
| `transcripts` | `array` | ⚡ Conditional | Mảng dữ liệu transcript. Bắt buộc nếu không có `meetId`. |
| `history` | `array` | ❌ Không | Lịch sử chat trước đó để AI hiểu ngữ cảnh hội thoại. |
| `locale` | `string` | ❌ Không | Ngôn ngữ trả lời: `vi` (Tiếng Việt) hoặc `en` (Tiếng Anh). Mặc định là `vi`. |

> **Lưu ý ⚡:** Bạn phải cung cấp ít nhất một trong hai trường: `meetId` hoặc `transcripts`.

### Ví dụ 1: Sử dụng `meetId` (Khuyên dùng)

Dùng khi transcript đã được lưu trong database.

```json
{
  "meetId": "abc-defg-hij",
  "message": "Ai là người nói nhiều nhất trong cuộc họp?",
  "locale": "vi",
  "history": [
    {
      "role": "user",
      "content": "Cuộc họp này nói về chủ đề gì?"
    },
    {
      "role": "assistant",
      "content": "Cuộc họp thảo luận về tiến độ dự án và phân chia task cho sprint tới."
    }
  ]
}
```

### Ví dụ 2: Truyền `transcripts` trực tiếp

Dùng khi muốn chat với một đoạn hội thoại cụ thể hoặc dữ liệu chưa lưu vào DB.

```json
{
  "message": "Tóm tắt ý chính của Nguyễn Văn A",
  "transcripts": [
    {
      "speaker": "Nguyễn Văn A",
      "text": "Chào mọi người, hôm nay chúng ta bàn về deadline.",
      "recorded_at": "2026-01-29T10:00:00Z"
    },
    {
      "speaker": "Trần Thị B",
      "text": "Tôi nghĩ chúng ta cần dời deadline sang tuần sau.",
      "recorded_at": "2026-01-29T10:01:00Z"
    }
  ],
  "locale": "vi"
}
```

---

## 2. Response Structure

### Thành công (200 OK)

```json
{
  "success": true,
  "reply": "Dựa trên transcript, Nguyễn Văn A là người bắt đầu cuộc thảo luận về deadline...",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 1250,
    "completion_tokens": 85,
    "total_tokens": 1335
  },
  "context": {
    "speakers": ["Nguyễn Văn A", "Trần Thị B"],
    "totalUtterances": 45,
    "transcriptLength": 5600
  },
  "meetId": "abc-defg-hij"
}
```

| Field | Type | Mô tả |
|-------|------|-------|
| `success` | `boolean` | Trạng thái request. |
| `reply` | `string` | Câu trả lời từ AI. |
| `model` | `string` | Model AI được sử dụng (ví dụ: `gpt-4o`). |
| `usage` | `object` | Thông tin về số lượng token đã sử dụng. |
| `context` | `object` | Thông tin tóm tắt về transcript được dùng làm context. |
| `meetId` | `string` | ID cuộc họp (nếu có). |

### Lỗi (Error Responses)

**Thiếu thông tin bắt buộc (400 Bad Request):**

```json
{
  "success": false,
  "error": "Either meetId or transcripts array is required"
}
```

**Không tìm thấy transcript (404 Not Found):**

```json
{
  "success": false,
  "error": "No transcripts found for this meeting",
  "meetId": "abc-defg-hij"
}
```

---

## 3. Postman / cURL Example

```bash
curl -X POST http://localhost:3001/chat/transcript \
  -H "Content-Type: application/json" \
  -d '{
    "meetId": "test-meeting-id",
    "message": "Tóm tắt các quyết định chính"
  }'
```
