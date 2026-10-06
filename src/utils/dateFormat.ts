/**
 * 格式化日期显示
 * @param date - 日期对象或日期字符串
 * @param lang - 语言 ('zh' | 'en')
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, lang: 'zh' | 'en' = 'zh'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (lang === 'zh') {
    // 中文格式: 2025年1月1日
    return formatDateChinese(dateObj);
  } else {
    // 英文格式: January 1, 2025 (美式英语)
    return formatDateEnglish(dateObj);
  }
}

/**
 * 中文日期格式: 2025年1月1日
 */
function formatDateChinese(date: Date): string {
  // ✅ 修复：使用 UTC 方法，避免字符串日期（如 "2025-01-15"）在
  // UTC-x 时区被解析为前一天（例如 UTC-8 下显示为 1月14日）
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  return `${year}年${month}月${day}日`;
}

/**
 * 英文日期格式: January 1, 2025 (美式)
 */
function formatDateEnglish(date: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // ✅ 修复：使用 UTC 方法，避免时区偏移导致的日期错误
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * 获取相对时间 (可选功能)
 * @param date - 日期
 * @param lang - 语言
 * @returns 例如 "3天前", "3 days ago"
 */
export function getRelativeTime(date: Date | string, lang: 'zh' | 'en' = 'zh'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  // ✅ 修复：基于 UTC 日期计算天数差，避免时区偏移影响
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return lang === 'zh' ? '今天' : 'Today';
  } else if (diffDays === 1) {
    return lang === 'zh' ? '昨天' : 'Yesterday';
  } else if (diffDays < 7) {
    return lang === 'zh' ? `${diffDays}天前` : `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return lang === 'zh' ? `${weeks}周前` : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return lang === 'zh' ? `${months}个月前` : `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return lang === 'zh' ? `${years}年前` : `${years} year${years > 1 ? 's' : ''} ago`;
  }
}
