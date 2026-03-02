<<<<<<< HEAD
# Xink Analysis Meeting Backend

Backend server cho ứng dụng Note Pro Meeting Bot với tích hợp Vexa AI, PostgreSQL database, Socket.IO realtime và OpenAI API.

## 🏗️ Cấu trúc Project (MVC)

```
src/
├── config/           # Cấu hình (database, app settings)
│   ├── app.js        # Application configuration
│   └── database.js   # Database connection & schema
├── models/           # Database models
│   ├── Transcript.js # Transcript model - lưu trữ hội thoại
│   ├── Meeting.js    # Meeting model - quản lý cuộc họp
│   ├── Url.js        # URL model - quản lý URLs
│   └── index.js
├── controllers/      # Logic xử lý request
│   ├── TranscriptController.js
│   ├── VexaController.js
│   ├── AnalyzeController.js
│   ├── UrlController.js
│   ├── FileController.js
│   ├── MeetingController.js
│   └── index.js
├── services/         # Business logic
│   ├── TranscriptService.js  # Lưu transcript vào DB
│   ├── VexaService.js        # Vexa AI integration
│   ├── OpenAIService.js      # OpenAI integration
│   ├── UrlService.js         # URL management
│   └── index.js
├── routes/           # Định nghĩa routes
│   ├── transcripts.js
│   ├── vexa.js
│   ├── analyze.js
│   ├── urls.js
│   ├── files.js
│   ├── meetings.js
│   └── index.js
├── middlewares/      # Custom middlewares
│   └── index.js
├── utils/            # Helper functions
│   ├── textCleaner.js
│   └── index.js
├── socket/           # Socket.IO handlers
│   └── index.js
├── app.js            # Express app setup
└── index.js          # Entry point
```

## 🚀 Tính năng chính

- **Vexa AI Integration**: Proxy API cho Vexa AI services
- **Realtime Transcripts**: Socket.IO để nhận transcript realtime từ meetings
- **Transcript Database Storage**: Lưu trữ transcripts vào PostgreSQL ✨ NEW
- **Meeting Management**: Quản lý cuộc họp và phân tích ✨ NEW
- **URL Management**: Quản lý và health check URLs
- **OpenAI Analysis**: Phân tích và chat với OpenAI API
- **Rate Limiting**: Giới hạn request để bảo vệ API

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- PostgreSQL >= 12.0
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd xink-analysis-meeting-backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables

Tạo file `.env` với nội dung:
```env
PORT=3001

# Vexa AI
VEXA_API_KEY=your_vexa_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vexa_backend
DB_USER=postgres
DB_PASSWORD=your_password

# Optional
DATA_DIR=./data
```

## 🏃‍♂️ Chạy ứng dụng

### Development mode (với nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

### Legacy mode (file index.js cũ)
```bash
npm run start:legacy
```

Server sẽ chạy tại: `http://localhost:3001`

## 📊 Database Schema

### transcripts
Bảng lưu trữ các đoạn hội thoại từ cuộc họp.

| Column      | Type        | Description                |
|-------------|-------------|----------------------------|
| id          | SERIAL      | Primary key                |
| meet_id     | VARCHAR(100)| ID cuộc họp                |
| speaker     | VARCHAR(255)| Tên người nói              |
| text        | TEXT        | Nội dung hội thoại         |
| recorded_at | TIMESTAMP   | Thời điểm ghi nhận         |
| start_time  | FLOAT       | Thời gian bắt đầu (giây)   |
| end_time    | FLOAT       | Thời gian kết thúc (giây)  |
| metadata    | JSONB       | Dữ liệu bổ sung            |

### meetings
Bảng quản lý thông tin cuộc họp.

| Column       | Type        | Description                |
|--------------|-------------|----------------------------|
| id           | SERIAL      | Primary key                |
| meet_id      | VARCHAR(100)| ID cuộc họp (unique)       |
| title        | VARCHAR(500)| Tiêu đề cuộc họp           |
| platform     | VARCHAR(50) | Platform (google_meet, zoom)|
| started_at   | TIMESTAMP   | Thời điểm bắt đầu          |
| ended_at     | TIMESTAMP   | Thời điểm kết thúc         |
| participants | JSONB       | Danh sách người tham gia    |
| status       | VARCHAR(50) | Trạng thái (active, ended) |
| analysis     | JSONB       | Kết quả phân tích AI       |

### urls
Bảng quản lý URLs cho health check.

| Column      | Type        | Description                |
|-------------|-------------|----------------------------|
| id          | SERIAL      | Primary key                |
| url         | VARCHAR(500)| URL (unique)               |
| name_server | VARCHAR(255)| Tên server                 |
| is_active   | BOOLEAN     | Trạng thái hoạt động       |

## 📡 API Endpoints

### Transcript Management (NEW ✨)

#### Ingest transcript
```bash
POST /ingest
Content-Type: application/json

{
  "meetId": "abc-defg-hij",
  "at": "2024-01-28T10:00:00Z",
  "item": {
    "speaker": "John Doe",
    "text": "Hello everyone"
  }
}
```

#### Get all transcripts for a meeting
```bash
GET /transcripts/:meetId?limit=100&offset=0
```

#### Get formatted transcript
```bash
GET /script/:meetId?format=txt|md|srt|vtt|json
```

#### Get transcript statistics
```bash
GET /transcripts/:meetId/stats
```

#### Search transcripts
```bash
GET /transcripts/:meetId/search?q=keyword
```

#### Migrate file-based transcripts to DB
```bash
POST /transcripts/:meetId/migrate
```

### Meeting Management (NEW ✨)

#### List all meetings
```bash
GET /api/meetings?limit=50&offset=0&status=active
```

#### Get meeting details
```bash
GET /api/meetings/:meetId
```

#### Create/update meeting
```bash
POST /api/meetings
{
  "meetId": "abc-defg-hij",
  "title": "Team Standup",
  "platform": "google_meet"
}
```

#### Update meeting status
```bash
PATCH /api/meetings/:meetId/status
{
  "status": "ended"
}
```

### Vexa AI Proxy
- `POST /api/bots` - Tạo bot meeting
- `DELETE /api/bots/:platform/:code` - Xóa bot
- `GET /api/transcripts/:platform/:code` - Lấy transcript từ Vexa

### URL Management
- `GET /api/urls?url=<url>` - Lưu URL vào database
- `POST /api/urls` - Tạo URL mới
- `GET /api/urls/list` - Lấy danh sách URLs
- `POST /api/urls/health-check` - Kiểm tra health
- `DELETE /api/urls/:id` - Xóa URL

### OpenAI Analysis
- `POST /analyze` - Phân tích text với OpenAI
- `POST /chat` - Chat với context từ analysis

### File Management
- `GET /api/files` - Liệt kê files
- `DELETE /api/files/:meetId` - Xóa file

### Health Check
- `GET /` - Server status
- `GET /health` - Health check JSON

## 🔌 Socket.IO Events

### Client → Server
- `join` - Tham gia room Vexa transcript
- `leave` - Rời room Vexa transcript
- `meet:join` - Tham gia room meeting (nhận full transcripts từ DB)
- `meet:leave` - Rời room meeting

### Server → Client
- `transcript:new` - Transcript mới từ Vexa
- `transcript:error` - Lỗi từ Vexa
- `ingest:new` - Transcript mới được lưu vào DB
- `ingest:full` - Full transcripts từ DB (khi join)
- `ingest:error` - Lỗi khi lấy transcripts

## 🧪 Testing API

### Test Transcript Ingest
```bash
curl -X POST http://localhost:3001/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "meetId": "test-meet-123",
    "item": {
      "speaker": "Test User",
      "text": "This is a test transcript"
    }
  }'
```

### Test Get Transcripts
```bash
curl http://localhost:3001/transcripts/test-meet-123
```

### Test Migrate File to DB
```bash
curl -X POST http://localhost:3001/transcripts/test-meet-123/migrate
```

### Test OpenAI Analysis
```bash
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Nội dung cần phân tích...",
    "meetId": "test-meet-123",
    "locale": "vi"
  }'
```

## 🔧 Troubleshooting

### Lỗi Database Connection
```bash
# Kiểm tra PostgreSQL service
sudo service postgresql status

# Kiểm tra connection
psql -U postgres -h localhost -d vexa_backend
```

### Lỗi API Keys
- Đảm bảo `VEXA_API_KEY` và `OPENAI_API_KEY` được set trong `.env`
- Kiểm tra API keys có hợp lệ không

### Port đã được sử dụng
```bash
# Thay đổi PORT trong .env
PORT=3002
```

## 📝 Migration từ version cũ

Nếu bạn đang sử dụng file `index.js` cũ và muốn migrate sang MVC:

1. Chạy server mới: `npm run dev`
2. Migrate từng meeting: `POST /transcripts/:meetId/migrate`
3. Hoặc tiếp tục sử dụng file cũ: `npm run start:legacy`

## 📝 Scripts

- `npm start` - Chạy server production
- `npm run dev` - Chạy server với nodemon (development)
- `npm run start:legacy` - Chạy file index.js cũ
- `npm test` - Chạy tests

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

ISC License

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
=======

# Transcript AI - React + Tailwind Application

A comprehensive AI-powered transcription and analysis platform built with React, Vite, and Tailwind CSS. This application provides real-time transcription, AI analysis, and interactive chat features for meetings and audio content.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Features

### 🎯 Core Functionality
- **File Upload & Transcription**: Upload video/audio files for AI transcription
- **Live Meeting Integration**: Join Google Meet sessions with AI bot for real-time transcription
- **AI Analysis**: Get intelligent summaries, highlights, and action items
- **Interactive Chat**: Chat with AI about your transcript content
- **PDF Export**: Download analysis results as formatted PDF files

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI with cyan/teal color scheme
- **Sidebar Navigation**: Easy access to all features
- **Tabbed Interface**: Organized content display
- **Real-time Updates**: Live transcript updates during meetings

## 🛠️ How to Use

### 1. File Upload & Analysis

#### Upload Audio/Video Files
1. Navigate to the **Home** page
2. Click on the **"Upload File"** tab
3. Drag and drop or click to select your audio/video file
4. Wait for transcription to complete
5. Click **"Analyze"** to get AI insights

#### Supported File Formats
- Audio: MP3, WAV, M4A, AAC
- Video: MP4, AVI, MOV, MKV

### 2. Live Meeting Transcription

#### Join Google Meet Sessions
1. Go to the **Home** page
2. Click on the **"Live Meeting"** tab
3. Enter your Google Meet link or meeting code
4. Set bot name and language preferences
5. Click **"Start Meeting"** to begin transcription
6. View real-time transcript in the **"Transcript Live Meeting"** tab
7. Click **"Analyze"** to get AI analysis of the conversation

#### Meeting Code Format
- Full URL: `https://meet.google.com/abc-defg-hij`
- Meeting Code: `abc-defg-hij`

### 3. AI Analysis Features

#### Summary Tab
- Get comprehensive summaries of your content
- Download as PDF with proper formatting
- Includes document metadata and creation date

#### Highlights Tab
- Key points and important information extraction
- Numbered list format for easy reading
- PDF export available

#### To-Do Tab
- Action items with priorities and deadlines
- Owner assignments and rationale
- Organized by priority levels
- PDF export with detailed formatting

#### Chat with AI Tab
- Interactive conversation about your transcript
- Ask questions and get contextual answers
- Markdown support for rich responses
- Chat history preservation

#### Full Transcript Tab
- Complete transcript with speaker identification
- Timestamp information
- Structured display for easy reading

### 4. Content Management

#### View All Transcripts
1. Click **"All Transcripts"** in the sidebar
2. Browse your transcription history
3. Click on any item to load it in the Home page
4. View and analyze previous content

#### Transcript History
- Automatic saving of all transcriptions
- Search and filter capabilities
- Quick access to previous analyses

### 5. PDF Export

#### Download Options
- **Summary PDF**: Complete summary with metadata
- **Highlights PDF**: Key points in organized format
- **To-Do PDF**: Action items with details and priorities

#### PDF Features
- ✅ UTF-8 support for Vietnamese and international characters
- ✅ Professional formatting and layout
- ✅ Document metadata inclusion
- ✅ High-quality rendering

## 🔧 Technical Details

### API Endpoints
- **Transcription**: `POST /transcribe` - Upload files for transcription
- **Analysis**: `POST /analyze` - Get AI analysis of text content
- **Chat**: `POST /chat` (legacy). New transcript-chat endpoint: `POST http://localhost:9000/chat/transcript` with body `{ "message": "...", "transcripts": [{ "speaker":"...", "text":"...", "at":"ISO-8601" }] }`. The client can be pointed at a different host via `VITE_CHAT_TRANSCRIPT_URL_BASE` in your `.env`.
- **Live Meeting**: `POST /api/bots` - Create meeting bot
- **Live Transcript**: `GET /api/transcripts/google_meet/{code}` - Fetch live transcript

### Data Storage
- **Local Storage**: Transcripts and analysis results
- **Session Management**: Meeting data and chat history
- **Real-time Updates**: Live transcript polling

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎨 Customization

### Color Scheme
The application uses a cyan/teal color palette:
- Primary: `#0891B2`
- Secondary: `#0E7490`
- Accent: `#06B6D4`

### Styling
- Built with Tailwind CSS
- Responsive design
- Dark/light mode support
- Custom gradient backgrounds

## 🚨 Troubleshooting

### Common Issues

#### File Upload Problems
- Ensure file size is under 100MB
- Check file format compatibility
- Verify internet connection

#### Live Meeting Issues
- Verify Google Meet link format
- Check bot permissions in meeting
- Ensure stable internet connection

#### PDF Export Errors
- Clear browser cache
- Try different browser
- Check file permissions

### Error Messages
- **"Chat failed: 400"**: Check API endpoint configuration
- **"Transcription failed"**: Verify file format and size
- **"Meeting join failed"**: Check meeting link and permissions

## 📱 Mobile Support

The application is fully responsive and works on:
- Mobile phones (iOS/Android)
- Tablets (iPad/Android tablets)
- Desktop computers
- All screen sizes

## 🔒 Privacy & Security

- All data processed locally when possible
- Secure API communication
- No permanent storage of sensitive content
- GDPR compliant data handling

## 🤝 Support

For technical support or feature requests:
- Check the troubleshooting section above
- Review API documentation
- Contact development team

---

**Made by XinK AI** - Powered by advanced AI transcription and analysis technology.

>>>>>>> bda0b3c (new feat)
