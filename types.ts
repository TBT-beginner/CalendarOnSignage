export interface CalendarEvent {
  summary: string;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "10:30"
  isAllDay: boolean;
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  backgroundColor: string;
}
