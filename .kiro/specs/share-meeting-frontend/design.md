# Share Meeting Frontend - Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Flow (Authenticated)                │
├─────────────────────────────────────────────────────────────┤
│  TranscriptDetail → ShareButton → ShareModal                 │
│                                    ↓                          │
│                            [Publish/Unpublish]               │
│                                    ↓                          │
│                            API Call → Update UI              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Guest Flow (Public)                      │
├─────────────────────────────────────────────────────────────┤
│  Share URL → SharedMeetingView → Fetch Data → Display       │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. ShareButton Component

**Location:** `src/components/ShareButton.jsx`

**Props:**
```typescript
interface ShareButtonProps {
  meetId: string;
  meetingTitle: string;
  isPublished?: boolean;
  shareUrl?: string;
  onPublishSuccess?: (shareUrl: string) => void;
  onUnpublishSuccess?: () => void;
}
```

**State:**
```javascript
{
  showModal: boolean,
  loading: boolean,
  error: string | null
}
```

**Behavior:**
- Render button với icon Share2 từ lucide-react
- Click button → open ShareModal
- Pass meetId, meetingTitle, isPublished, shareUrl to modal
- Handle modal close

**Styling:**
```css
- Button: flex items-center gap-2
- Background: bg-blue-500 hover:bg-blue-600
- Text: text-white
- Padding: px-4 py-2
- Border radius: rounded-lg
- Icon size: w-4 h-4
```

---

### 2. ShareModal Component

**Location:** `src/components/ShareModal.jsx`

**Props:**
```typescript
interface ShareModalProps {
  meetId: string;
  meetingTitle: string;
  isPublished: boolean;
  shareUrl?: string;
  onClose: () => void;
  onPublishSuccess?: (shareUrl: string) => void;
  onUnpublishSuccess?: () => void;
}
```

**State:**
```javascript
{
  isPublished: boolean,
  shareUrl: string | null,
  publishing: boolean,
  unpublishing: boolean,
  copied: boolean,
  error: string | null,
  showConfirmUnpublish: boolean
}
```

**API Methods:**

```javascript
// Publish meeting
async function handlePublish() {
  setPublishing(true);
  setError(null);
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${backendUrl}/api/meetings/${meetId}/publish`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to publish');
    }
    
    const data = await res.json();
    setIsPublished(true);
    setShareUrl(data.shareUrl);
    onPublishSuccess?.(data.shareUrl);
  } catch (err) {
    setError(err.message);
  } finally {
    setPublishing(false);
  }
}

// Unpublish meeting
async function handleUnpublish() {
  setUnpublishing(true);
  setError(null);
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${backendUrl}/api/meetings/${meetId}/unpublish`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!res.ok) {
      const error = await res.json()