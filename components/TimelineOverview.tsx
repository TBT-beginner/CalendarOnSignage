
import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from '../types';

interface TimelineOverviewProps {
  events: CalendarEvent[];
}

const START_HOUR = 8;
const END_HOUR = 24;
const HOUR_HEIGHT_PX = 60; // 1 hour = 60px
const TOTAL_HOURS = END_HOUR - START_HOUR;

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToPosition = (minutes: number): number => {
  const startMinutes = START_HOUR * 60;
  return ((minutes - startMinutes) / 60) * HOUR_HEIGHT_PX;
};

const TimelineOverview: React.FC<TimelineOverviewProps> = ({ events }) => {
  const [currentTimePosition, setCurrentTimePosition] = useState(0);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      setCurrentTimePosition(minutesToPosition(minutes));
    };
    updateCurrentTime();
    const intervalId = setInterval(updateCurrentTime, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  const timedEvents = useMemo(() => events.filter(e => !e.isAllDay), [events]);

  return (
    <div className="relative">
      {/* Timeline labels (hours) */}
      <div className="absolute top-0 left-0 -ml-12 w-10 text-right text-xs text-gray-400">
        {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
          const hour = START_HOUR + i;
          return (
            <div
              key={`hour-${hour}`}
              className="relative"
              style={{ height: `${HOUR_HEIGHT_PX}px` }}
            >
              <span className="absolute -top-2">{`${hour}:00`}</span>
            </div>
          );
        })}
      </div>

      {/* Timeline grid */}
      <div className="relative border-l border-gray-300 dark:border-gray-700 ml-5">
        {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
          <div
            key={`grid-${i}`}
            className="border-t border-gray-300 dark:border-gray-700"
            style={{ height: `${HOUR_HEIGHT_PX}px` }}
          />
        ))}

        {/* Current time indicator */}
        {currentTimePosition >= 0 && currentTimePosition <= TOTAL_HOURS * HOUR_HEIGHT_PX && (
           <div
            className="absolute left-0 w-full flex items-center"
            style={{ top: `${currentTimePosition}px` }}
            >
                <div className="absolute -left-1.5 w-3 h-3 bg-red-500 rounded-full z-10"></div>
                <div className="w-full border-t border-red-500"></div>
            </div>
        )}

        {/* Events */}
        <div className="absolute top-0 left-2 right-0">
          {timedEvents.map((event, index) => {
            const startMinutes = timeToMinutes(event.startTime);
            const endMinutes = timeToMinutes(event.endTime);
            const top = minutesToPosition(startMinutes);
            const height = minutesToPosition(endMinutes) - top;

            if (height <= 0) return null;

            return (
              <div
                key={index}
                className="absolute w-full pr-2"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                }}
              >
                <div className="h-full bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{event.summary}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">{event.startTime} - {event.endTime}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineOverview;
