# Share Meeting Frontend - Requirements

## Feature Name

share-meeting-frontend

## Overview

Implement frontend UI/UX cho tính năng Share Meeting, cho phép user publish/unpublish meetings và guest xem shared content mà không cần đăng nhập.

## User Stories

### US-1: User Publish Meeting

**As a** logged-in user  
**I want to** publish my meeting và nhận share URL  
**So that** tôi có thể chia sẻ transcript và analysis với người khác

**Acceptance Criteria:**

1. User thấy nút "Share" trên TranscriptDetail page
2. Click "Share" mở modal với options
3. Click "Publish" gọi API `POST /api/meetings/:meetId/publish`
4. Hiển thị share URL sau khi publish thành công
5. User có thể copy URL bằng nút "Copy"
6. Hiển thị trạng thái "Copied!" sau khi copy
7. Nếu meeting đã published, hiển thị existing share URL
8. Hiển thị error message nếu publish thất bại

### US-2: User Unpublish Meeting

**As a** logged-in user  
**I want to** unpublish meeting đã share  
**So that** người khác không thể truy cập nữa

**Acceptance Criteria:**

1. Nếu meeting đã published, hiển thị nút "Unpublish" trong modal
2. Click "Unpublish" gọi API `POST /api/meetings/:meetId/unpublish`
3. Hiển thị confirmation dialog trước khi unpublish
4. Sau unpublish, share URL không còn hiển thị
5. Hiển thị success message sau khi unpublish
6. Hiển thị error message nếu unpublish thất bại

### US-3: User Copy Share URL

**As a** logged-in user  
**I want to** copy share URL dễ dàng  
**So that** tôi có thể gửi cho người khác qua email/chat

**Acceptance Criteria:**

1. Hiển thị share URL trong text input (read-only)
2. Có nút "Copy" bên cạnh URL
3. Click "Copy" copy URL vào clipboard
4. Hiển thị icon "Check" và text "Copied!" trong 2 giây
5. Sau 2 giây, icon trở lại "Copy"
6. URL có thể select và copy manually

### US-4: Guest View Shared Meeting (Public Page)

**As a** guest (không đăng nhập)  
**I want to** xem meeting info và transcript qua share URL  
**So that** tôi có thể đọc nội dung meeting mà không cần tạo account

**Acceptance Criteria:**

1. Guest truy cập URL `/shared/:shareToken`
2. Page load meeting info từ `GET /api/meetings/shared/:shareToken`
3. Hiển thị meeting title, date, platform, participants
4. Hiển thị transcript segments với speaker và text
5. Hiển thị analysis (summary, highlights, todos) nếu có
6. Page có responsive design (mobile-friendly)
7. Hiển thị error page nếu share token không hợp lệ
8. Hiển thị error page nếu meeting đã unpublished
9. Không hiển thị navigation/header của authenticated app
10. Có watermark "Shared via Note Pro Meeting" ở footer

### US-5: Share Status Indicator

**As a** logged-in user  
**I want to** thấy meeting nào đã được shared  
**So that** tôi biết meeting nào đang public

**Acceptance Criteria:**

1. Trên TranscriptDetail, hiển thị badge "Shared" nếu meeting đã published
2. Badge có icon Share và text "Public"
3. Badge có màu xanh để dễ nhận biết
4. Hover badge hiển thị tooltip "This meeting is publicly shared"
5. Trên AllTranscripts list, hiển thị icon Share nhỏ cho meetings đã shared

### US-6: Error Handling

**As a** user hoặc guest  
**I want to** thấy error messages rõ ràng  
**So that** tôi biết vấn đề gì xảy ra

**Acceptance Criteria:**

1. Network error: "Failed to connect. Please check your internet."
2. 401 Unauthorized: "Please login to share meetings"
3. 404 Not Found: "Meeting not found or has been unpublished"
4. 500 Server Error: "Something went wrong. Please try again."
5. Invalid share token: "This share link is invalid or expired"
6. Meeting already published: Hiển thị existing URL thay vì error
7. Tất cả errors hiển thị trong toast/alert với auto-dismiss sau 5s

## Technical Requirements

### API Integration

#### Authenticated Endpoints (User)

```javascript
// Publish meeting
POST /api/meetings/:meetId/publish
Headers: { Authorization: Bearer TOKEN }
Response: { success, shareUrl, message }

// Unpublish meeting
POST /api/meetings/:meetId/unpublish
Headers: { Authorization: Bearer TOKEN }
Response: { success, message }
```

#### Public Endpoints (Guest)

```javascript
// Get shared meeting info
GET /api/meetings/shared/:shareToken
Response: { success, data: { meet_id, title, platform, started_at, ended_at, participants, status, analysis } }

// Get shared transcript
GET /api/meetings/shared/:shareToken/transcript
Response: { platform, segments: [...], total }
```

### State Management

- Meeting publish status (isPublished, shareUrl)
- Loading states (publishing, unpublishing, loading shared content)
- Error states
- Copy status (copied/not copied)

### Components to Create

1. **ShareButton** (`src/components/ShareButton.jsx`)
   - Nút "Share" với icon
   - Trigger ShareModal

2. **ShareModal** (`src/components/ShareModal.jsx`)
   - Modal hiển thị share options
   - Publish/Unpublish buttons
   - Share URL display với copy button
   - Loading và error states

3. **SharedMeetingView** (`src/pages/SharedMeetingView.jsx`)
   - Public page cho guest
   - Hiển thị meeting info
   - Hiển thị transcript
   - Hiển thị analysis
   - Error handling

4. **ShareStatusBadge** (`src/components/ShareStatusBadge.jsx`)
   - Badge hiển thị "Shared" status
   - Tooltip

### Routing

```javascript
// Public route (no auth required)
<Route path="/shared/:shareToken" element={<SharedMeetingView />} />
```

### Styling Requirements

- Modal: Centered, max-width 500px, rounded corners, shadow
- Share URL input: Read-only, monospace font, full width
- Copy button: Icon button, hover effect, success state
- Badge: Small, rounded, blue background, white text
- Public page: Clean, minimal, professional
- Responsive: Mobile-first design

### Performance

- Lazy load SharedMeetingView component
- Debounce copy button clicks
- Cache shared meeting data (5 minutes)
- Optimize transcript rendering for large segments

### Accessibility

- Modal: Focus trap, ESC to close, ARIA labels
- Copy button: Keyboard accessible, screen reader friendly
- Share URL: Selectable, copyable
- Public page: Semantic HTML, proper heading hierarchy
- Error messages: ARIA live regions

### Security

- Validate share token format before API call
- Sanitize meeting data before display
- No sensitive user info on public page
- Rate limiting on public endpoints (handled by backend)

## Non-Functional Requirements

### Performance

- Modal open/close: < 100ms
- API calls: < 2s timeout
- Copy to clipboard: < 50ms
- Public page load: < 3s

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support

- iOS Safari 14+
- Chrome Mobile 90+
- Responsive design: 320px - 1920px

## Out of Scope (Future Enhancements)

- Password protection
- Expiration dates
- View count tracking
- Email notifications
- Share analytics
- Custom share URLs
- Embed codes
- Social media sharing buttons

## Dependencies

- Backend API endpoints (already implemented)
- React Router for routing
- lucide-react for icons
- Clipboard API for copy functionality

## Success Metrics

- User can publish meeting in < 3 clicks
- Copy URL success rate > 95%
- Guest can view shared content without login
- Error rate < 5%
- Mobile usability score > 90%

## Testing Requirements

- Unit tests for components
- Integration tests for API calls
- E2E tests for user flows
- Manual testing on mobile devices
- Accessibility testing with screen readers

## Localization

Support Vietnamese and English:

- "Share" / "Chia sẻ"
- "Copy Link" / "Sao chép liên kết"
- "Copied!" / "Đã sao chép!"
- "Publish" / "Công khai"
- "Unpublish" / "Hủy công khai"
- "This meeting is publicly shared" / "Cuộc họp này đang được chia sẻ công khai"
- Error messages in both languages
