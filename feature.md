## Xink Analysis Meeting - Feature & Workflow Spec

Mục tiêu: mô tả đầy đủ các luồng nghiệp vụ và chức năng của web app, làm cơ sở phân tích và thiết kế backend/database.

### 1) Tổng quan hệ thống
- **Ứng dụng web** giúp người dùng:
  - Upload file audio/video để chuyển giọng nói thành văn bản (transcribe) và phân tích nội dung (analyze).
  - Khởi tạo bot tham gia Google Meet để ghi lại transcript theo thời gian thực, xem transcript trực tiếp, và phân tích sau cuộc họp.
  - Xem kết quả phân tích: tóm tắt, highlights, danh sách việc cần làm (todos).
  - Tương tác hỏi đáp (chat) dựa trên kết quả phân tích.
- **Frontend**: React + Vite + Tailwind.
- **Backend(s)**: 
  - Backend chính (REST) cho phân tích, chat, quản lý transcript/bot: `VITE_BACKEND_URL`.
 

### 2) Các trang/chức năng chính
- `Home` (tập trung 3 flow):
  1. Upload Transcript (`UploadPanel.jsx`)
     - Upload file (audio/video/doc)
     - Gửi file đến AI backend `/transcribe` để lấy transcript
     - Hiển thị transcript, cho phép gọi `/analyze` để phân tích
  2. Live Meeting (`LiveMeetingPanel.jsx`)
     - Nhập mã Google Meet
     - Gọi `POST /api/bots` tạo bot tham gia phòng
     - Poll transcript: `GET /api/transcripts/google_meet/:code`
     - Lưu segments vào local và cập nhật UI
  3. Live Transcript Meeting (`TranscriptLiveMeeting.jsx`)
     - Hiển thị/refresh transcript theo chu kỳ
     - Cho phép phân tích toàn bộ transcript (gọi `/analyze` theo cơ chế chia chunk nếu dài)

- `ResultPanel.jsx`
  - Hiển thị summary, highlights, todos từ kết quả phân tích đã lưu theo `id`
  - Chat dựa trên kết quả: `POST /chat`

- `LiveTranslation.jsx`
  - Nhập `meetingId` để xem dữ liệu mới nhất: `GET {backendAIUrl}/latest/:meetingId`
  - Poll mỗi 3s nếu bật
  - `backendAIUrl` lấy động từ `GET {backendUrl}/api/urls/list` (ưu tiên `healthyUrls[0]`)

- `Authentication` (có `AuthContext`, `LoginForm`, `ProtectedRoute`) – hiện tại chủ yếu khung, chưa thấy tích hợp sâu vào các flow ở trên.

### 3) Luồng nghiệp vụ chi tiết

#### A. Upload & Transcribe & Analyze
1. Người dùng chọn file → FE tạo `FormData(file, lang)`
2. FE gọi `POST {backendAIUrl}/transcribe` → nhận `{ transcript, duration, filename }`
3. FE hiển thị transcript, cho phép bấm Analyze
4. FE gọi `POST {backendUrl}/analyze` với `{ text, locale, maxHighlights, maxTodos }`
   - Nếu văn bản dài: FE chia chunk theo câu và gửi tuần tự, cộng dồn kết quả và gộp lại (đã xử lý 429 TPM)
5. FE tạo bản ghi transcript cục bộ (qua `src/services/transcripts.js`) và đính `analysisResult`
6. `ResultPanel` hiển thị kết quả, cho phép chat: `POST {backendUrl}/chat` (legacy) hoặc `POST http://localhost:9000/chat/transcript` — payload hiện tại: `{ message, transcripts: [{ speaker, text, at }] }`.

Example:

```http
POST http://localhost:9000/chat/transcript
Content-Type: application/json

{
  "message":"có bao nhiêu người tham gia, nêu rõ họ tên của họ",
  "transcripts":[
    {"speaker":"Nguyễn Quang Huy","text":"Quyết định: tăng ngân sách Q2","at":"2025-12-01T10:00:00Z"},
    {"speaker":"Bảo","text":"Minh sẽ theo dõi tiến độ","at":"2025-12-01T10:01:00Z"}
  ]
}
```

#### B. Live Meeting Bot (Google Meet)
1. Nhập `native_meeting_id` và tham số (ngôn ngữ, tên bot)
2. FE gọi `POST {backendUrl}/api/bots`
3. Poll transcript: `GET {backendUrl}/api/transcripts/google_meet/:code`
   - Chuẩn hoá segments: id, speaker, text, time markers
   - Lưu local và render UI
4. Khi đủ nội dung, bấm Analyze → gọi `/analyze` như luồng A (có chunking)

#### C. Live Translation
1. FE lấy `backendAIUrl` từ `GET {backendUrl}/api/urls/list` → dùng `healthyUrls[0]`
2. Người dùng nhập `meetingId`
3. FE gọi `GET {backendAIUrl}/latest/:meetingId` để lấy transcript items mới nhất
4. Có thể bật polling mỗi 3 giây



### 5) Ràng buộc & kỹ thuật giao tiếp
- CORS: đang giải quyết bằng Vite proxy và thiết lập headers; backend vẫn nên bật CORS cho `http://localhost:5173` và origin production "".
- Rate limit/token limit: FE đã có chunking + delay giữa các request phân tích.
- `backendAIUrl` là động, lấy từ danh sách healthy URLs; cần health-check phía backend.

### 6) Đề xuất mô hình dữ liệu (Database postgres)

Các bảng lõi:

1. `users`
   - id (pk)
   - email (unique), name, avatar_url
   - auth_provider, provider_user_id
   - created_at, updated_at, last_login_at

2. `meetings`
   - id (pk)
   - native_meeting_id (Google Meet code)
   - platform (enum: google_meet, zoom, teams...)
   - owner_user_id (fk users)
   - is_live (bool), started_at, ended_at
   - target_language, bot_name

3. `transcripts`
   - id (pk)
   - meeting_id (fk meetings, nullable nếu transcript độc lập từ upload)
   - source_type (enum: upload, live_meet)
   - source_filename, duration_sec
   - original_text (long text, optional nếu lưu segments riêng)
   - output_lang (vi|en)
   - created_by (fk users), created_at, updated_at

4. `transcript_segments`
   - id (pk)
   - transcript_id (fk transcripts)
   - speaker
   - text
   - start_time, end_time (nullable)
   - sequence_no
   - created_at

5. `analyses`
   - id (pk)
   - transcript_id (fk transcripts)
   - summary (long text)
   - raw_json (jsonb)  // lưu kết quả thô (nếu muốn)
   - created_at

6. `highlights`
   - id (pk)
   - analysis_id (fk analyses)
   - text
   - category (nullable)
   - score (nullable)

7. `todos`
   - id (pk)
   - analysis_id (fk analyses)
   - task
   - due (datetime, nullable)
   - owner_hint (text, nullable)
   - priority (enum/nullable)
   - rationale (text, nullable)
   - status (enum: open, done, canceled)

8. `chat_messages`
   - id (pk)
   - transcript_id (fk transcripts)
   - role (user|assistant)
   - content (long text)
   - created_at

9. `bots`
   - id (pk)
   - meeting_id (fk meetings)
   - status (enum: creating, joined, running, stopped, failed)
   - provider_bot_id
   - created_at, updated_at, last_heartbeat_at



Quan hệ chính:
- users 1—n meetings
- meetings 1—n transcripts
- transcripts 1—n transcript_segments
- transcripts 1—1 analyses (có thể 1—n nếu lưu lịch sử phân tích)
- analyses 1—n highlights, 1—n todos
- transcripts 1—n chat_messages
- meetings 1—n bots

### 7) Đề xuất API backend tương ứng

- Auth: `POST /auth/login`, `POST /auth/logout`, `GET /me`
- Meetings:
  - `POST /meetings` (tạo meeting thủ công)
  - `GET /meetings/:id`
  - `GET /meetings?owner=me`
- Bots:
  - `POST /api/bots` (đã dùng)
  - `GET /bots/:id/status`
  - `POST /bots/:id/stop`
- Transcripts:
  - `POST /transcripts/upload` (nhận file, tạo transcript + segments)
  - `GET /transcripts/:id`
  - `GET /api/transcripts/google_meet/:code` (có)
  - `PUT /transcripts/:id/segments` (batch update)
- Analysis:
  - `POST /analyze` (đã có)
  - `GET /analyses/:id`
  - `POST /analyses/:id/reanalyze` (tuỳ chọn)



### 8) Lưu ý triển khai
- Phân quyền: user chỉ thấy tài nguyên của mình; owner-based hoặc tổ chức/team.
- Lưu file gốc (upload) ở object storage, lưu metadata trong DB.
- Idempotency khi poll và cập nhật segments (dựa trên `id` hoặc time markers).
- Ghi log & metrics cho `/analyze` để theo dõi chi phí token và độ trễ.
- CORS: cấu hình allow origin rõ ràng ở backend; hạn chế wildcard trong production.

### 9) Sơ đồ dữ liệu (rút gọn)

users (1) ──< meetings (n) ──< transcripts (n) ──< transcript_segments (n)
                                  └── analyses (1..n) ──< highlights (n)
                                                        └── todos (n)
transcripts (1) ──< chat_messages (n)
meetings (1) ──< bots (n)


---
Tài liệu này có thể dùng làm nền để thiết kế migration, định nghĩa model/service layer, và chuẩn hoá hợp đồng API giữa FE/BE.


