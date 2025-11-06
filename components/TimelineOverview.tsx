import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TimelineOverviewProps {
  events: CalendarEvent[];
  showEndTime: boolean;
}

const isCurrentEvent = (event: CalendarEvent, now: Date): boolean => {
  if (event.isAllDay) {
    return false;
  }
  
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Only check events for today
  if (event.date !== todayStr) {
    return false;
  }

  const startTime = new Date(`${event.date}T${event.startTime}`);
  const endTime = new Date(`${event.date}T${event.endTime}`);
  
  return now >= startTime && now < endTime;
};


const TimelineOverviewItem: React.FC<{ event: CalendarEvent, showEndTime: boolean, isCurrent: boolean }> = ({ event, showEndTime, isCurrent }) => {
    const { theme } = useTheme();
    const timeText = event.isAllDay ? '終日' : event.startTime;

    const containerClasses = [
      'flex', 'items-start', 'space-x-4', 'py-2', 'transition-all', 'duration-300', 'rounded-lg'
    ];
    if (isCurrent) {
      containerClasses.push(theme.accentBg, 'text-white', 'px-3', '-mx-3', 'shadow-lg');
    }

    const timeClasses = `${theme.fontDisplay} w-24 flex-shrink-0 text-left text-xl ${isCurrent ? 'text-white' : theme.textPrimary}`;
    const summaryClasses = `flex-grow text-xl tracking-tight font-medium ${isCurrent ? 'text-white' : theme.textPrimary}`;
    const endTimeClasses = `ml-2 text-base ${isCurrent ? 'text-white/70' : theme.textMuted}`;

    return (
        <div className={containerClasses.join(' ')}>
            <p className={timeClasses}>{timeText}</p>
            <div className="flex-grow flex items-baseline">
                <p className={summaryClasses}>{event.summary}</p>
                 {showEndTime && !event.isAllDay && event.endTime && (
                  <span className={endTimeClasses}>〜{event.endTime}</span>
                )}
            </div>
        </div>
    );
};

const TimelineOverview: React.FC<TimelineOverviewProps> = ({ events, showEndTime }) => {
  const { theme } = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 30 * 1000); // update every 30 seconds
    return () => clearInterval(timerId);
  }, []);

  if (events.length === 0) {
    return (
      <div 
        className={`${theme.cardBg} rounded-2xl p-6 flex flex-col h-full shadow-lg`}
      >
        <h3 className={`text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4 border-b-2 ${theme.border} pb-3 flex-shrink-0`}>
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
      className={`${theme.cardBg} rounded-2xl p-6 flex flex-col h-full shadow-lg`}
    >
      <h3 className={`text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4 border-b-2 ${theme.border} pb-3 flex-shrink-0`}>
        今日一日の予定
      </h3>
      <div className="flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <div>
              {leftColumnEvents.map((event, index) => {
                const isCurrent = isCurrentEvent(event, now);
                return (
                  <TimelineOverviewItem
                    key={`overview-left-${index}-${event.summary}`}
                    event={event}
                    showEndTime={showEndTime}
                    isCurrent={isCurrent}
                  />
                );
              })}
            </div>
            <div>
              {rightColumnEvents.map((event, index) => {
                const isCurrent = isCurrentEvent(event, now);
                return (
                  <TimelineOverviewItem
                    key={`overview-right-${index}-${event.summary}`}
                    event={event}
                    showEndTime={showEndTime}
                    isCurrent={isCurrent}
                  />
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineOverview;