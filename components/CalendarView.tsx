import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import Clock from './Clock';
import EventStatusSummary from './EventStatusSummary';
import TimelineOverview from './TimelineOverview';
import CalendarIcon from './icons/CalendarIcon';
import AllDayEventsBanner from './AllDayEventsBanner';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import SettingsIcon from './icons/SettingsIcon';
import WeeklyView from './WeeklyView';

interface CalendarViewProps {
  events: CalendarEvent[];
  onSignOut: () => void;
  onOpenCalendarSelection: () => void;
  hasSelectedCalendars: boolean;
  isLoading: boolean;
}

const getCurrentTimeHHMM = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onSignOut, onOpenCalendarSelection, hasSelectedCalendars, isLoading }) => {
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(getCurrentTimeHHMM());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(getCurrentTimeHHMM());
    }, 1000 * 60);

    return () => clearInterval(timerId);
  }, []);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const todaysEvents = events.filter(e => e.date === todayString);
  const weeklyEvents = events.filter(e => e.date > todayString);
  
  const allDayEvents = todaysEvents.filter(e => e.isAllDay);
  const timedEvents = todaysEvents.filter(e => !e.isAllDay);

  const getEventStatus = (event: CalendarEvent): 'past' | 'current' | 'upcoming' => {
    if (currentTime > event.endTime) {
      return 'past';
    }
    if (currentTime >= event.startTime && currentTime <= event.endTime) {
      return 'current';
    }
    return 'upcoming';
  };

  const eventStatuses = timedEvents.map(getEventStatus);
  const currentEvents = timedEvents.filter((_, index) => eventStatuses[index] === 'current');
  
  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <header className={`flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-6 pb-4 border-b ${theme.border}`}>
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div 
              className={`rounded-2xl p-3 ${theme.buttonBorder}`}
              style={{ boxShadow: theme.clayButtonShadow }}
             >
              <CalendarIcon className={`w-8 h-8 ${theme.textPrimary}`} />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${theme.headerText} ${theme.fontDisplay}`}>今日のスケジュール</h1>
              <p className={theme.headerSubtext}>Googleカレンダーより</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenCalendarSelection}
              className={`${theme.headerText} p-2 rounded-full ${theme.hoverBg} transition-all focus:outline-none ${theme.buttonBorder}`}
              aria-label="表示カレンダーの選択"
              style={{ boxShadow: theme.clayButtonShadow, transition: 'box-shadow 0.1s ease-in-out' }}
              onMouseDown={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonPressedShadow)}
              onMouseUp={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonShadow)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonShadow)}
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <Clock />
      </header>
      
      { !hasSelectedCalendars && !isLoading ? (
        <div className="flex-grow flex items-center justify-center">
            <div 
              className={`text-center ${theme.cardBg} ${theme.cardBorder} rounded-3xl p-8 max-w-lg`}
              style={{ boxShadow: theme.clayShadow }}
            >
                <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4`}>カレンダーが選択されていません</h2>
                <p className={`${theme.textSecondary} mb-6`}>
                ヘッダーの設定アイコンをクリックして、表示したいカレンダーを選択してください。
                </p>
                <button
                    onClick={onOpenCalendarSelection}
                    className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center mx-auto ${theme.button} ${theme.buttonText} ${theme.buttonBorder}`}
                    style={{ boxShadow: theme.clayButtonShadow, transition: 'box-shadow 0.1s ease-in-out' }}
                    onMouseDown={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonPressedShadow)}
                    onMouseUp={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonShadow)}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonShadow)}
                >
                    <SettingsIcon className="w-5 h-5 mr-2" />
                    カレンダーを選択
                </button>
            </div>
        </div>
      ) : (
        <main className="flex-grow flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="w-full lg:flex-grow flex flex-col gap-6">
            <AllDayEventsBanner events={allDayEvents} />
            
            <div 
              className={`relative flex-grow ${theme.cardBg} ${theme.cardBorder} rounded-2xl p-6 min-h-[12rem] sm:min-h-[14rem] flex items-center justify-center overflow-hidden`}
              style={{ boxShadow: theme.clayShadow }}
            >
              <EventStatusSummary currentEvents={currentEvents} />
            </div>
            
            <div className="flex-grow">
              <TimelineOverview events={timedEvents} eventStatuses={eventStatuses} />
            </div>
          </div>
          
          {/* Right column */}
          <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0">
              <WeeklyView events={weeklyEvents} isLoading={isLoading} />
          </div>
        </main>
      )}


      <footer className="mt-auto pt-6 text-center">
          <button 
            onClick={onSignOut}
            className={`${theme.textMuted} hover:${theme.textPrimary} transition text-sm font-semibold`}
          >
            サインアウト
          </button>
      </footer>
    </div>
  );
};

export default CalendarView;
