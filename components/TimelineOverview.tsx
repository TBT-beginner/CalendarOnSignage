import React from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TimelineOverviewProps {
  events: CalendarEvent[];
}

const TimelineOverviewItem: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const { theme } = useTheme();
    const timeText = event.isAllDay ? '終日' : event.startTime;

    return (
        <div className={`flex items-start space-x-4 py-2`}>
            <p className={`${theme.fontDisplay} w-24 flex-shrink-0 text-right text-xl ${theme.textPrimary}`}>{timeText}</p>
            <p className={`flex-grow text-xl tracking-tight font-medium ${theme.textPrimary}`}>{event.summary}</p>
        </div>
    );
};

const TimelineOverview: React.FC<TimelineOverviewProps> = ({ events }) => {
  const { theme } = useTheme();
  
  if (events.length === 0) {
    return (
      <div 
        className={`${theme.cardBg} ${theme.cardBorder} rounded-2xl p-6 flex flex-col h-full`}
        style={{ boxShadow: theme.clayShadow }}
      >
        <h3 className={`text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4 border-b ${theme.border} pb-3 flex-shrink-0`}>
          今日一日の予定
        </h3>
        <div className="flex-grow flex items-center justify-center">
          <p className={`${theme.textMuted} text-lg`}>今日の予定はありません。</p>
        </div>
      </div>
    );
  }

  // Split events into two columns to save vertical space and avoid scrolling
  const midPoint = Math.ceil(events.length / 2);
  const leftColumnEvents = events.slice(0, midPoint);
  const rightColumnEvents = events.slice(midPoint);

  return (
    <div 
      className={`${theme.cardBg} ${theme.cardBorder} rounded-2xl p-6 flex flex-col h-full`}
      style={{ boxShadow: theme.clayShadow }}
    >
      <h3 className={`text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4 border-b ${theme.border} pb-3 flex-shrink-0`}>
        今日一日の予定
      </h3>
      <div className="flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <div>
              {leftColumnEvents.map((event, index) => (
                <TimelineOverviewItem
                  key={`overview-left-${index}-${event.summary}`}
                  event={event}
                />
              ))}
            </div>
            <div>
              {rightColumnEvents.map((event, index) => (
                <TimelineOverviewItem
                  key={`overview-right-${index}-${event.summary}`}
                  event={event}
                />
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineOverview;