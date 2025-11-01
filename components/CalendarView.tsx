import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import Clock from './Clock';
import EventStatusSummary from './EventStatusSummary';
import TimelineOverview from './TimelineOverview';
import CalendarIcon from './icons/CalendarIcon';
import { useTheme } from '../contexts/ThemeContext';

interface CalendarViewProps {
  events: CalendarEvent[];
  onSignOut: () => void;
}

const getCurrentTimeHHMM = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onSignOut }) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(getCurrentTimeHHMM());

  useEffect(() => {
    // Update time every minute
    const timerId = setInterval(() => {
      setCurrentTime(getCurrentTimeHHMM());
    }, 1000 * 60);

    return () => clearInterval(timerId);
  }, []);

  const getEventStatus = (event: CalendarEvent): 'past' | 'current' | 'upcoming' => {
    if (currentTime > event.endTime) {
      return 'past';
    }
    if (currentTime >= event.startTime && currentTime <= event.endTime) {
      return 'current';
    }
    return 'upcoming';
  };

  const eventStatuses = events.map(getEventStatus);
  const currentEvents = events.filter((_, index) => eventStatuses[index] === 'current');
  const nextUpcomingEvent = events.find((_, index) => eventStatuses[index] === 'upcoming');

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <header className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`${theme.cardBg} ${theme.cardOpacity} rounded-lg p-3 shadow-md`}>
             <CalendarIcon className={`w-8 h-8 ${theme.textPrimary}`} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${theme.headerText}`}>今日のスケジュール</h1>
            <p className={theme.headerSubtext}>Googleカレンダーより</p>
          </div>
        </div>
        <Clock />
      </header>

      <div className={`relative flex-grow ${theme.cardBg} rounded-lg shadow-lg p-6 mb-6 h-32 sm:h-48 flex items-center justify-center border-gray-200/50 overflow-hidden`}>
        <EventStatusSummary currentEvents={currentEvents} />
      </div>
      
      <main className="flex-grow flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <TimelineOverview events={events} eventStatuses={eventStatuses} />
        </div>

        <div className={`w-full lg:w-1/3 flex flex-col ${theme.cardBg} rounded-lg shadow-lg p-6`}>
          <h2 className={`text-xl sm:text-2xl font-bold ${theme.textPrimary} mb-4 border-b border-gray-200 pb-2`}>
            次の予定
          </h2>
          <div className="flex-grow flex flex-col justify-center min-h-[10rem]">
            {nextUpcomingEvent ? (
              <div>
                <p className={`font-display text-xl sm:text-2xl ${theme.textSecondary}`}>{nextUpcomingEvent.startTime} - {nextUpcomingEvent.endTime}</p>
                <h3 className={`text-2xl sm:text-3xl font-bold ${theme.textPrimary} mt-1 leading-tight`}>{nextUpcomingEvent.summary}</h3>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className={`${theme.textMuted} text-lg sm:text-xl`}>今日の予定はすべて終了しました。</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-6 text-center">
          <button 
            onClick={onSignOut}
            className={`${theme.headerText} opacity-80 hover:opacity-100 transition text-sm font-semibold`}
          >
            サインアウト
          </button>
      </footer>
    </div>
  );
};

export default CalendarView;