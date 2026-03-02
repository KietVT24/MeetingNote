// src/utils/textCleaner.js

// Patterns to remove from transcript text
const ALL_PATTERNS = [
    'Chào mừng các bạn đã xem video hấp dẫn.',
    'Hãy đăng ký kênh để xem video mới nhất.',
    'Cảm ơn các bạn đã xem video này.',
    'Hãy đăng ký kênh để ủng hộ kênh của mình.',
    'Hãy đăng ký kênh để ủng hộ kênh của mình để nhận được những video hấp dẫn',
    'Hãy subscribe cho kênh Ghiền Mì Gõ Để không bỏ lỡ những video hấp dẫn',
    'Các bạn hãy đăng ký kênh để xem những video mới nhất.',
    'Cảm ơn các bạn đã xem video hấp dẫn.',
    'Hãy đăng ký kênh để xem video mới nha!',
    'Hãy đăng ký kênh để xem những video mới nhất.',
    'Chào mừng quý vị, và hẹn gặp lại trong các video tiếp theo!',
    'Cảm ơn các bạn đã xem video.',
    'Cảm ơn các bạn đã theo dõi.',
    'Hẹn gặp lại các bạn trong video tiếp theo.',
    'Đừng quên đăng ký kênh để không bỏ lỡ video mới.',
    'Nhớ bấm chuông để nhận thông báo video mới.',
    'Hãy like và share để ủng hộ kênh.',
    'Đừng quên để lại bình luận bên dưới.',
    'Mọi người nhớ đăng ký kênh nhé.',
    'Hẹn gặp lại ở những video tiếp theo.',
    'Xin chào và hẹn gặp lại.',
    'Cảm ơn mọi người đã xem hết video.',
    'Đừng quên nhấn like, share và subscribe nhé.',
    'Nhấn theo dõi kênh để nhận những video mới nhất.',
    'Link mình để ở phần mô tả.',
    'Thông tin chi tiết ở phần mô tả.',
    'để ủng hộ kênh của mình để nhận được những video mới nhất.',
    'video hấp dẫn'
];

// Regex patterns for flexible matching
const VARIANT_REGEXES = [
    // Subscribe/register + channel + new videos
    /\b(đừng\s+quên|hãy|nhớ)\s+(đăng\s*ký|sub(?:scribe)?|theo\s*dõi)\s+(kênh|channel)\b.*?(video|clip)?\s*(mới|mới\s+nhất|tiếp\s+theo|không\s+bỏ\s+lỡ)?[.!?…]*\s*/giu,

    // Like + share + comment + bell notification
    /\b(đừng\s+quên|hãy|nhớ)\s+(nhấn|bấm|cho)\s+like\b[.!?…]*\s*/giu,
    /\b(đừng\s+quên|hãy|nhớ)\s+(share|chia\s*sẻ)\b[.!?…]*\s*/giu,
    /\b(đừng\s+quên|hãy|nhớ)\s+(để\s*lại|viết)\s*(bình\s*luận|comment)\b[.!?…]*\s*/giu,
    /\b(đừng\s+quên|hãy|nhớ)\s+(bấm|nhấn)\s+(chuông|thông\s*báo|bell)\b[.!?…]*\s*/giu,

    // Thank you + watching/following
    /\b(cảm\s*ơn|xin\s*cảm\s*ơn)\s+(các\s*bạn|mọi\s*người|quý\s*vị).{0,40}\b(xem|theo\s*dõi)\b[.!?…]*\s*/giu,

    // Goodbye + next video
    /\b(hẹn\s*gặp\s*lại|hẹn\s*gặp)\s+(các\s*bạn|mọi\s*người)?.{0,30}\b(video|clip)\s*(tiếp\s*theo|sau)\b[.!?…]*\s*/giu,
    /\b(xin\s*chào|chào\s*(mừng)?\s*(các\s*bạn|mọi\s*người|quý\s*vị))([^\n]{0,80})?\b(hẹn\s*gặp\s*lại)\b[.!?…]*\s*/giu,

    // New video/newest videos
    /\b(xem|nhận)\s+(những\s+)?(video|clip)\s+(mới|mới\s+nhất)\b[.!?…]*\s*/giu,

    // Link/details in description
    /\b(link|thông\s*tin|chi\s*tiết).{0,20}\b(phần|mục)\s+mô\s*tả\b[.!?…]*\s*/giu,

    // Support channel
    /\b(ủng\s*hộ\s*kênh|ủng\s*hộ\s*mình|ủng\s*hộ\s*chúng\s*tôi)\b[.!?…]*\s*/giu,
];

// Create soft regex from exact phrases
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PHRASE_REGEXES = ALL_PATTERNS.map(p =>
    new RegExp(`\\s*${esc(p.trim()).replace(/\s+/g, '\\s+')}[.!?…]*\\s*`, 'giu')
);

/**
 * Clean text by removing spam/promotional content
 */
export function cleanText(text) {
    if (!text) return text;
    let out = text;

    // Remove exact phrases first
    for (const rx of PHRASE_REGEXES) out = out.replace(rx, ' ');

    // Remove variant patterns
    for (const rx of VARIANT_REGEXES) out = out.replace(rx, ' ');

    // Clean up
    out = out
        .replace(/\s{2,}/g, ' ')          // Merge multiple spaces
        .replace(/\s+([?!,.;…])/g, '$1')  // Remove space before punctuation
        .replace(/([?!,.;…]){2,}/g, '$1') // Merge duplicate punctuation
        .trim();

    return out;
}

export default { cleanText };
