
import { CalendarEvent } from '../types';

// 表示したいカレンダーのIDリスト
// 'primary' はログインしているユーザーのメインカレンダーを指す特別なキーワードです。
const CALENDAR_IDS = [
  'primary',
  'c_classroom67a5c44f@group.calendar.google.com'
];


/**
 * Formats an ISO datetime string (e.g., "2024-07-27T10:00:00+09:00") or a date string ("2024-07-27")
 * into HH:MM format.
 * @param dateTime The event start or end object from Google Calendar API.
 * @param isEnd For all-day events, specifies if it's the end time.
 * @returns Time string "HH:MM".
 */
const formatApiTime = (dateTime: { dateTime?: string; date?: string }, isEnd: boolean = false): string => {
  if (dateTime.dateTime) {
    // Extracts HH:MM from "YYYY-MM-DDTHH:MM:SS..."
    return dateTime.dateTime.substring(11, 16);
  }
  if (dateTime.date) {
    // All-day event
    return isEnd ? '24:00' : '00:00';
  }
  return 'N/A';
};


/**
 * Fetches event data from Google Calendar API for the current day from multiple calendars.
 * Requires a valid OAuth 2.0 access token.
 * @param accessToken The OAuth 2.0 access token for authorization.
 * @returns A promise that resolves to an array of CalendarEvent objects, combined and sorted.
 */
export const fetchGoogleCalendarEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timeMin = today.toISOString();
  
  today.setHours(23, 59, 59, 999);
  const timeMax = today.toISOString();

  const fetchPromises = CALENDAR_IDS.map(calendarId => {
    const apiUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    apiUrl.searchParams.append('timeMin', timeMin);
    apiUrl.searchParams.append('timeMax', timeMax);
    apiUrl.searchParams.append('singleEvents', 'true');
    apiUrl.searchParams.append('orderBy', 'startTime');
  
    return fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    }).then(response => {
      if (!response.ok) {
        if (response.status === 401) {
            throw new Error('認証が切れました。再度サインインしてください。');
        }
        if (response.status === 404) {
            throw new Error(`カレンダーID "${calendarId}" が見つかりません。アクセス権限を確認してください。`);
        }
        throw new Error(`カレンダー "${calendarId}" のデータ取得に失敗しました。権限がない可能性があります。`);
      }
      return response.json();
    });
  });

  const results = await Promise.all(fetchPromises);
  
  const allEvents: CalendarEvent[] = [];
  results.forEach(data => {
    if (data.items) {
      const events: CalendarEvent[] = data.items.map((item: any) => ({
        summary: item.summary || '（タイトルなし）',
        startTime: formatApiTime(item.start),
        endTime: formatApiTime(item.end, true),
        isAllDay: !!item.start.date, // If 'date' property exists, it's an all-day event
      }));
      allEvents.push(...events);
    }
  });

  // Combine events from all calendars and sort them by start time.
  return allEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
};