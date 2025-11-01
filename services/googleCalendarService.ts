import { CalendarEvent } from '../types';

// 'primary' is a special keyword that refers to the main calendar of the logged-in user.
const CALENDAR_ID = 'primary';

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
 * Fetches event data from Google Calendar API for the current day.
 * Requires a valid OAuth 2.0 access token.
 * @param accessToken The OAuth 2.0 access token for authorization.
 * @returns A promise that resolves to an array of CalendarEvent objects.
 */
export const fetchGoogleCalendarEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timeMin = today.toISOString();
  
  today.setHours(23, 59, 59, 999);
  const timeMax = today.toISOString();

  const apiUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`);
  apiUrl.searchParams.append('timeMin', timeMin);
  apiUrl.searchParams.append('timeMax', timeMax);
  apiUrl.searchParams.append('singleEvents', 'true');
  apiUrl.searchParams.append('orderBy', 'startTime');

  const response = await fetch(apiUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
        throw new Error('認証が切れました。再度サインインしてください。');
    }
    if (response.status === 404) {
        throw new Error('指定されたカレンダーが見つかりません。IDを確認してください。');
    }
    throw new Error('カレンダーデータの取得に失敗しました。権限がない可能性があります。');
  }

  const data = await response.json();

  if (!data.items) {
    return [];
  }

  const events: CalendarEvent[] = data.items.map((item: any) => ({
    summary: item.summary || '（タイトルなし）',
    startTime: formatApiTime(item.start),
    endTime: formatApiTime(item.end, true),
  }));
  
  // The API already sorts by start time, but we can re-sort just in case.
  return events.sort((a, b) => a.startTime.localeCompare(b.startTime));
};