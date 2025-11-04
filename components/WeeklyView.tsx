import React from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface WeeklyViewProps {
  events: CalendarEvent[];
  isLoading: boolean;
}

const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric', weekday: 'short' };
  return new Intl.DateTimeFormat('ja-JP', options).format(date);
};

const WeeklyView: React.FC<WeeklyViewProps> = ({ events, isLoading }) => {
  const { theme } = useTheme();

  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div
      className={`w-full h-full flex flex-col ${theme.cardBg} ${theme.cardBorder} rounded-2xl p-6 min-h-0`}
      style={{ boxShadow: theme.clayShadow }}
    >
      <h2 className={`text-xl sm:text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4 border-b ${theme.border} pb-2 flex-shrink-0`}>
        今週の予定
      </h2>
      <div className="flex-grow custom-scrollbar overflow-y-auto pr-2 -mr-2">
        {sortedDates.length > 0 ? (
          <div className="space-y-4">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className={`font-bold ${theme.textSecondary} ${theme.fontDisplay} text-lg mb-2`}>
                  {formatDateHeader(date)}
                </h3>
                <ul className={`space-y-1.5 pl-2 border-l-2 ${theme.border}`}>
                  {eventsByDate[date].map((event, index) => (
                    <li key={`${date}-${index}-${event.summary}`} className={`flex items-start space-x-3 text-sm ${theme.textMuted}`}>
                      <span className="w-16 flex-shrink-0 text-right font-mono text-xs pt-1">
                        {event.isAllDay ? '終日' : `${event.startTime}`}
                      </span>
                      <span className={`flex-grow ${theme.textPrimary}`}>
                        {event.summary}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center h-full">
            <p className={`${theme.textMuted} text-lg`}>
              {isLoading ? '予定を読み込み中...' : '明日以降の予定はありません。'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyView;
