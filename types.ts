export interface CalendarEvent {
  summary: string;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "10:30"
  isAllDay: boolean;
  date: string; // e.g., "2024-07-28"
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  backgroundColor: string;
}

export interface MemberStatus {
  isPresent: boolean;
  comment: string;
}

export interface CheckboxState {
  [name: string]: MemberStatus;
}
