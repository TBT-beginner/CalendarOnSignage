import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface WeeklyViewProps {
  events: CalendarEvent[];
  isLoading: boolean;
  showEndTime: boolean;
}

const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric', weekday: 'short' };
  return new Intl.DateTimeFormat('ja-JP', options).format(date);
};

const autoScrollContainerStyle: React.CSSProperties = {
  maskImage: 'linear-gradient(transparent, black 10%, black 90%, transparent)',
  WebkitMaskImage: 'linear-gradient(transparent, black 10%, black 90%, transparent)',
};

const WeeklyView: React.FC<WeeklyViewProps> = ({ events, isLoading, showEndTime }) => {
  const { theme } = useTheme();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

  useEffect(() => {
    const checkHeight = () => {
      if (containerRef.current && contentRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        const contentHeight = contentRef.current.offsetHeight;
        setShouldAnimate(contentHeight > containerHeight);
      } else {
        setShouldAnimate(false);
      }
    };
    
    const timeoutId = setTimeout(checkHeight, 100);
    window.addEventListener('resize', checkHeight);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkHeight);
    };
  }, [events, isLoading]);

  const animationDuration = contentRef.current ? `${contentRef.current.offsetHeight / 30}s` : '20s';

  const renderEventList = () => (
    <div className="space-y-4">
      {sortedDates.map(date => (
        <div key={date}>
          <h3 className={`font-bold ${theme.textSecondary} ${theme.fontDisplay} text-lg mb-2`}>
            {formatDateHeader(date)}
          </h3>
          <ul className={`space-y-1.5 pl-2 border-l-2 ${theme.border}`}>
            {eventsByDate[date].map((event, index) => (
              <li key={`${date}-${index}-${event.summary}`} className="flex items-start space-x-3">
                <span className="w-14 flex-shrink-0 text-right font-mono text-sm pt-0.5 text-gray-500">
                  {event.isAllDay ? '終日' : `${event.startTime}`}
                </span>
                <div className={`flex-grow flex items-baseline`}>
                  <span className={`${theme.textPrimary} text-base`}>
                    {event.summary}
                  </span>
                  {showEndTime && !event.isAllDay && event.endTime && (
                    <span className={`ml-2 text-sm ${theme.textMuted}`}>〜{event.endTime}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`w-full h-full flex flex-col ${theme.cardBg} rounded-2xl p-6 min-h-0`}
    >
      <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4 border-b-2 ${theme.border} pb-3 flex-shrink-0`}>
        今週の予定
      </h2>
      <div ref={containerRef} className="flex-grow overflow-hidden relative" style={autoScrollContainerStyle}>
        {sortedDates.length > 0 ? (
          <div
            className={shouldAnimate ? 'absolute top-0 left-0 w-full' : ''}
            style={shouldAnimate ? { animation: `scroll-vertical ${animationDuration} linear infinite` } : {}}
          >
            <div ref={contentRef} className="pb-8">
              {renderEventList()}
            </div>
            {shouldAnimate && (
              <div>
                {renderEventList()}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
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