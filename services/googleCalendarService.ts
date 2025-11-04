import { CalendarEvent, CalendarListEntry } from '../types';

/**
 * Fetches the list of calendars the user has access to.
 * @param accessToken The OAuth 2.0 access token.
 * @returns A promise that resolves to an array of CalendarListEntry objects.
 */
export const fetchCalendarList = async (accessToken: string): Promise<CalendarListEntry[]> => {
  const apiUrl = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('認証が切れました。再度サインインしてください。');
    }
    throw new Error('カレンダーリストの取得に失敗しました。');
  }

  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.id,
    summary: item.summary,
    backgroundColor: item.backgroundColor,
  }));
};


/**
 * Formats an ISO datetime string (e.g., "2024-07-27T10:00:00+09:00") or a date string ("2024-07-27")
 * into HH:MM format based on the browser's local timezone.
 * @param dateTime The event start or end object from Google Calendar API.
 * @param isEnd For all-day events, specifies if it's the end time.
 * @returns Time string "HH:MM".
 */
const formatApiTime = (dateTime: { dateTime?: string; date?: string }, isEnd: boolean = false): string => {
  if (dateTime.dateTime) {
    // Create a Date object from the ISO string.
    // This will automatically parse the string and adjust to the browser's local timezone.
    const date = new Date(dateTime.dateTime);
    
    // Format the time into HH:MM using local timezone.
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  if (dateTime.date) {
    // All-day event
    return isEnd ? '24:00' : '00:00';
  }
  return 'N/A';
};


/**
 * Fetches event data from Google Calendar API for the next 7 days from multiple calendars.
 * Requires a valid OAuth 2.0 access token.
 * @param accessToken The OAuth 2.0 access token for authorization.
 * @param calendarIds An array of calendar IDs to fetch events from.
 * @returns A promise that resolves to an array of CalendarEvent objects, combined and sorted.
 */
export const fetchGoogleCalendarEvents = async (accessToken: string, calendarIds: string[]): Promise<CalendarEvent[]> => {
  if (calendarIds.length === 0) {
    return Promise.resolve([]);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timeMin = today.toISOString();
  
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 6); // Today + 6 days = 7 days total
  sevenDaysLater.setHours(23, 59, 59, 999);
  const timeMax = sevenDaysLater.toISOString();

  const fetchPromises = calendarIds.map(calendarId => {
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
            console.warn(`カレンダーID "${calendarId}" が見つかりません。アクセス権限を確認してください。`);
            return null; // Return null to ignore this calendar
        }
        console.warn(`カレンダー "${calendarId}" のデータ取得に失敗しました。権限がない可能性があります。`);
        return null; // Also ignore on other errors like 403 Forbidden
      }
      return response.json();
    });
  });

  const results = await Promise.all(fetchPromises);
  
  const allEvents: CalendarEvent[] = [];
  results.forEach(data => {
    if (data && data.items) {
      const events: CalendarEvent[] = data.items.map((item: any) => {
        let eventDateStr: string;
        if (item.start.dateTime) {
          // Use new Date() to get the date in the browser's local timezone
          const localDate = new Date(item.start.dateTime);
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, '0');
          const day = String(localDate.getDate()).padStart(2, '0');
          eventDateStr = `${year}-${month}-${day}`;
        } else { // All-day event date is already in YYYY-MM-DD format and timezone-agnostic
          eventDateStr = item.start.date;
        }
        
        return {
          summary: item.summary || '（タイトルなし）',
          startTime: formatApiTime(item.start),
          endTime: formatApiTime(item.end, true),
          isAllDay: !!item.start.date, // If 'date' property exists, it's an all-day event
          date: eventDateStr,
        };
      });
      allEvents.push(...events);
    }
  });

  // Combine events from all calendars and sort them by date and start time.
  return allEvents.sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;

    const aDateTime = `${a.date}T${a.startTime}`;
    const bDateTime = `${b.date}T${b.startTime}`;
    return aDateTime.localeCompare(bDateTime);
  });
};