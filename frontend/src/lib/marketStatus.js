import { useState, useEffect } from 'react';

/**
 * Calculates accurate real-time Indian Stock Market (NSE / BSE) status in IST (UTC+5:30).
 * Market hours:
 * - Pre-market: 09:00 - 09:15 IST (Mon-Fri)
 * - Regular Trading: 09:15 - 15:30 IST (Mon-Fri)
 * - Post-market: 15:30 - 15:40 IST (Mon-Fri)
 * - Closed: After 15:40 IST, Before 09:00 IST, and Weekends (Sat-Sun)
 */
export function getIndianMarketStatus() {
  const now = new Date();

  // Extract IST time components
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  const parts = formatter.formatToParts(now);
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });

  const weekday = map.weekday; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const timeInMinutes = hour * 60 + minute;
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';

  let isOpen = false;
  let status = 'Market Closed';
  let badgeType = 'closed'; // 'open' | 'pre-open' | 'closed'
  let detail = '';

  if (isWeekend) {
    isOpen = false;
    status = 'Market Closed';
    badgeType = 'closed';
    detail = 'Weekend · Opens Mon 09:15 IST';
  } else if (timeInMinutes >= 540 && timeInMinutes < 555) {
    // 09:00 AM to 09:15 AM IST (Pre-Market)
    isOpen = false;
    status = 'Pre-Open Session';
    badgeType = 'pre-open';
    const minsToOpen = 555 - timeInMinutes;
    detail = `Opens in ${minsToOpen}m`;
  } else if (timeInMinutes >= 555 && timeInMinutes < 930) {
    // 09:15 AM to 03:30 PM IST (Normal Trading)
    isOpen = true;
    status = 'Market Open';
    badgeType = 'open';
    const remainingMins = 930 - timeInMinutes;
    const remH = Math.floor(remainingMins / 60);
    const remM = remainingMins % 60;
    detail = `Closes in ${remH > 0 ? `${remH}h ` : ''}${remM}m`;
  } else if (timeInMinutes >= 930 && timeInMinutes < 940) {
    // 03:30 PM to 03:40 PM IST (Closing session)
    isOpen = false;
    status = 'Post-Market Close';
    badgeType = 'closed';
    detail = 'Next open 09:15 IST';
  } else {
    // Overnight closed
    isOpen = false;
    status = 'Market Closed';
    badgeType = 'closed';
    if (weekday === 'Fri') {
      detail = 'Opens Mon 09:15 IST';
    } else {
      detail = 'Opens Today 09:15 IST';
    }
  }

  // Format real-time IST clock
  const istTimeStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  return {
    isOpen,
    status,
    badgeType,
    detail,
    istTime: `${istTimeStr} IST`,
    weekday,
  };
}

/**
 * Custom React Hook for live market status updates (re-evaluates every 1 second)
 */
export function useMarketStatus() {
  const [status, setStatus] = useState(getIndianMarketStatus);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getIndianMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return status;
}
