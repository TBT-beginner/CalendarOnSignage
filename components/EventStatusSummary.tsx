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
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="flex items-baseline justify-center space-x-4 animate-pulse">
            <span className={`font-display ${theme.accentText} font-bold text-2xl md:text-4xl hidden sm:inline`}>
              現在:
            </span>
            <h2 className={`text-3xl sm:text-4xl md:text-7xl font-bold ${theme.textPrimary} tracking-wider drop-shadow-lg text-center px-4`}>
              {currentEvent.summary}
            </h2>
            <span className={`font-display text-2xl md:text-4xl ${theme.textSecondary}`}>
              ({currentEvent.startTime} - {currentEvent.endTime})
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
            <span className={`font-display ${theme.accentText} font-bold text-2xl md:text-4xl`}>
              現在:
            </span>
            <h2 className={`text-3xl sm:text-4xl md:text-6xl font-bold ${theme.textPrimary} tracking-wider drop-shadow-lg ml-4 whitespace-nowrap`}>
              {event.summary}
            </h2>
            <span className={`font-display text-2xl md:text-4xl ${theme.textSecondary} ml-4`}>
              ({event.startTime} - {event.endTime})
            </span>
         </div>
      ))}
    </div>
  );
};

export default EventStatusSummary;