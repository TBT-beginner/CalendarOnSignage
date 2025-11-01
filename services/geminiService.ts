import { CalendarEvent } from '../types';

// The ID of the public Google Calendar
const CALENDAR_ID = 'c_classroom67a5c44f@group.calendar.google.com';

// We use a CORS proxy to fetch the iCal file from the client-side.
// This is necessary to bypass browser security restrictions (CORS policy).
const PROXY_URL = 'https://api.allorigins.win/get?url=';
const ICAL_URL = `${PROXY_URL}${encodeURIComponent(
  `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`
)}`;

/**
 * Parses a date/time string from an iCal file (e.g., "20240726T090000")
 * and returns the time in HH:MM format.
 * @param dateTimeString The full date-time string from the iCal file.
 * @returns A string representing the time, e.g., "09:00".
 */
const parseIcalTime = (dateTimeString: string): string => {
  const timePart = dateTimeString.split('T')[1] || '';
  if (timePart.length >= 4) {
    const hours = timePart.substring(0, 2);
    const minutes = timePart.substring(2, 4);
    return `${hours}:${minutes}`;
  }
  return '00:00'; // Default for all-day or invalid formats
};

/**
 * Fetches and parses event data from a public Google Calendar's iCal feed.
 * It only returns events scheduled for the current day.
 * @returns A promise that resolves to an array of CalendarEvent objects.
 */
export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const response = await fetch(ICAL_URL);
  if (!response.ok) {
    throw new Error('カレンダーデータの取得に失敗しました。ネットワーク接続を確認してください。');
  }

  // The proxy wraps the actual response in a JSON object.
  const data = await response.json();
  const icalData = data.contents;
  if (!icalData) {
    throw new Error('カレンダーが公開されていないか、データが空です。');
  }

  const events: CalendarEvent[] = [];
  const eventChunks = icalData.split('BEGIN:VEVENT');
  
  const today = new Date();
  const todayDateString = `${today.getFullYear()}${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

  for (const chunk of eventChunks) {
    if (!chunk.includes('SUMMARY:')) continue;

    const lines = chunk.replace(/\r/g, '').split('\n');
    let summary: string | null = null;
    let dtstart: string | null = null;
    let dtend: string | null = null;

    for (const line of lines) {
      if (line.startsWith('SUMMARY:')) {
        summary = line.substring(8).trim();
      } else if (line.startsWith('DTSTART')) {
        dtstart = line.split(':')[1]?.trim();
      } else if (line.startsWith('DTEND')) {
        dtend = line.split(':')[1]?.trim();
      }
    }

    // Check if the event is for today and has all required fields
    if (summary && dtstart && dtend && dtstart.startsWith(todayDateString)) {
      events.push({
        summary,
        startTime: parseIcalTime(dtstart),
        endTime: parseIcalTime(dtend),
      });
    }
  }

  // Sort events by start time
  return events.sort((a, b) => a.startTime.localeCompare(b.startTime));
};
