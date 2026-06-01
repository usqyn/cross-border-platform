// Kazakhstan timezone utilities
const KZ_TIMEZONE_OFFSET = -180; // Kazakhstan is UTC+5, Beijing is UTC+8 → 3 hours difference

// Normalize date string for iOS compatibility
function normalizeDateString(dateStr) {
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    return dateStr.replace(/-/g, '/');
  }
  return dateStr;
}

// Check if Kazakhstan is in work hours (9:00 - 18:00 local time, Mon-Fri)
function isKazakhstanWorkHours() {
  const now = new Date();
  
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
  const kzTime = new Date(utcTime.getTime() - 3 * 60 * 60 * 1000);
  
  const utcDay = kzTime.getUTCDay();
  const utcHour = kzTime.getUTCHours();
  
  return utcDay >= 1 && utcDay <= 5 && utcHour >= 9 && utcHour < 18;
}

// Get current Kazakhstan time as string
function getKazakhstanTime() {
  const now = new Date();
  
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
  const kzTime = new Date(utcTime.getTime() - 3 * 60 * 60 * 1000);
  
  const year = kzTime.getUTCFullYear();
  const month = (kzTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const date = kzTime.getUTCDate().toString().padStart(2, '0');
  const hours = kzTime.getUTCHours().toString().padStart(2, '0');
  const minutes = kzTime.getUTCMinutes().toString().padStart(2, '0');
  
  return `${year}/${month}/${date} ${hours}:${minutes}`;
}

// Get Kazakhstan local date info
function getKazakhstanDateInfo() {
  const now = new Date();
  
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
  const kzTime = new Date(utcTime.getTime() - 3 * 60 * 60 * 1000);
  
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const utcDay = kzTime.getUTCDay();
  const utcHour = kzTime.getUTCHours();
  
  return {
    date: `${kzTime.getUTCFullYear()}/${(kzTime.getUTCMonth() + 1).toString().padStart(2, '0')}/${kzTime.getUTCDate().toString().padStart(2, '0')}`,
    dayName: dayNames[utcDay],
    isWeekend: utcDay === 0 || utcDay === 6,
    isWorkHours: utcDay >= 1 && utcDay <= 5 && utcHour >= 9 && utcHour < 18
  };
}

// Format time difference message
function getTimezoneMessage() {
  if (isKazakhstanWorkHours()) {
    return '';
  }
  
  const now = new Date();
  const kzTime = new Date(now.getTime() + KZ_TIMEZONE_OFFSET * 60 * 1000);
  const day = kzTime.getDay();
  
  if (day === 0 || day === 6) {
    return '【当前哈萨克斯坦为周末，中介回复可能稍有延迟，请耐心等待】';
  }
  
  const hour = kzTime.getHours();
  if (hour < 9) {
    return '【当前哈萨克斯坦时间较晚，中介回复可能稍有延迟，请耐心等待】';
  } else if (hour >= 18) {
    return '【当前哈萨克斯坦已下班，中介回复可能稍有延迟，请耐心等待】';
  }
  
  return '';
}

module.exports = {
  isKazakhstanWorkHours,
  getKazakhstanTime,
  getTimezoneMessage,
  getKazakhstanDateInfo,
  normalizeDateString
};
