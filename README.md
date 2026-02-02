
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

