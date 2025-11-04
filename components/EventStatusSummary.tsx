import React from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface EventStatusSummaryProps {
  currentEvents: CalendarEvent[];
}

const EventStatusSummary: React.FC<EventStatusSummaryProps> = ({ currentEvents }) => {
  const { theme } = useTheme();

  if (currentEvents.length === 0) {
    return (
        <div className={`text-center ${theme.textMuted} text-xl sm:text-2xl md:text-3xl`}>
          現在進行中の予定はありません
        </div>
    );
  }
  
  if (currentEvents.length === 1) {
    const currentEvent = currentEvents[0];
    return (
      <div className="relative w-full h-full flex items-center justify-center animate-pulse">
        <div className="flex flex-col sm:flex-row items-baseline justify-center gap-x-4 gap-y-2 flex-wrap px-4">
          <span className={`${theme.fontDisplay} ${theme.accentText} font-bold text-2xl md:text-4xl`}>
            現在:
          </span>
          <h2 className={`text-3xl sm:text-5xl md:text-7xl font-bold ${theme.textPrimary} tracking-tight text-center leading-tight`}>
            {currentEvent.summary}
          </h2>
          <span className={`${theme.fontDisplay} text-2xl md:text-4xl font-bold ${theme.textPrimary}`}>
            {currentEvent.startTime}
          </span>
          <span className={`${theme.fontDisplay} text-xl md:text-2xl ${theme.textSecondary} self-end`}>
            ({currentEvent.endTime}まで)
          </span>
        </div>
      </div>
    );
  }

  // Marquee for multiple events
  const marqueeDuration = currentEvents.length * 8; // Adjust speed based on number of items

  return (
    <div className="absolute flex" style={{ animation: `marquee ${marqueeDuration}s linear infinite` }}>
      {/* Duplicate the list for a seamless loop */}
      {[...currentEvents, ...currentEvents].map((event, index) => (
         <div key={index} className="flex items-baseline flex-shrink-0 mx-8">
            <span className={`${theme.fontDisplay} ${theme.accentText} font-bold text-2xl md:text-4xl`} style={{ textShadow: `1px 1px 2px ${theme.accentShadow}`}}>
              現在:
            </span>
            <h2 className={`text-3xl sm:text-4xl md:text-6xl font-bold ${theme.textPrimary} tracking-wider ml-4 whitespace-nowrap`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              {event.summary}
            </h2>
            <span className={`${theme.fontDisplay} text-2xl md:text-4xl ${theme.textSecondary} ml-4`}>
              ({event.startTime} - {event.endTime})
            </span>
         </div>
      ))}
    </div>
  );
};

export default EventStatusSummary;
