import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TimelineOverviewProps {
  events: CalendarEvent[];
  eventStatuses: ('past' | 'current' | 'upcoming')[];
}

const ITEMS_PER_PAGE = 10;

const TimelineOverviewItem: React.FC<{ event: CalendarEvent, status: string }> = ({ event, status }) => {
    const theme = useTheme();
    const statusClasses = {
        past: theme.textMuted + ' opacity-70',
        current: theme.accentText + ' font-bold',
        upcoming: theme.textPrimary,
    };

    return (
        <div className={`flex items-start space-x-4 py-2 ${statusClasses[status]} transition-opacity duration-500`}>
            <p className="font-display w-20 sm:w-24 flex-shrink-0 text-right text-base sm:text-lg">{event.startTime}</p>
            <p className="flex-grow text-base sm:text-lg tracking-tight">{event.summary}</p>
        </div>
    );
};

const TimelineOverview: React.FC<TimelineOverviewProps> = ({ events, eventStatuses }) => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages <= 1) return;

    const timer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    }, 10000); // Change page every 10 seconds

    return () => clearInterval(timer);
  }, [totalPages]);

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvents = events.slice(startIndex, endIndex);
  const paginatedStatuses = eventStatuses.slice(startIndex, endIndex);

  const midPoint = Math.ceil(paginatedEvents.length / 2);
  const leftColumnEvents = paginatedEvents.slice(0, midPoint);
  const leftColumnStatuses = paginatedStatuses.slice(0, midPoint);
  const rightColumnEvents = paginatedEvents.slice(midPoint);
  const rightColumnStatuses = paginatedStatuses.slice(midPoint);

  return (
    <div className={`${theme.cardBg} rounded-lg shadow-lg p-4 flex flex-col h-full`}>
      <h3 className={`text-lg sm:text-xl font-bold ${theme.textPrimary} mb-2 border-b border-gray-200 pb-2 flex-shrink-0`}>
        今日のすべての予定
      </h3>
      <div className="custom-scrollbar overflow-y-auto flex-grow pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* Left Column */}
            <div>
              {leftColumnEvents.map((event, index) => (
                <TimelineOverviewItem
                  key={`overview-left-${event.summary}-${startIndex + index}`}
                  event={event}
                  status={leftColumnStatuses[index]}
                />
              ))}
            </div>
            {/* Right Column */}
            <div>
              {rightColumnEvents.map((event, index) => (
                <TimelineOverviewItem
                  key={`overview-right-${event.summary}-${startIndex + midPoint + index}`}
                  event={event}
                  status={rightColumnStatuses[index]}
                />
              ))}
            </div>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-4 flex-shrink-0">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentPage === index ? `${theme.paginationActive} w-6` : theme.paginationInactive
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineOverview;