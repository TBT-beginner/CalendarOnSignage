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
  
  const allDayEvents = events.filter(e => e.isAllDay);
  const timedEvents = events.filter(e => !e.isAllDay);

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
  const nextUpcomingEvent = timedEvents.find((_, index) => eventStatuses[index] === 'upcoming');

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className={`${theme.cardBg} ${theme.cardOpacity} rounded-lg p-3 shadow-md`}>
              <CalendarIcon className={`w-8 h-8 ${theme.textPrimary}`} />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${theme.headerText}`}>今日のスケジュール</h1>
              <p className={theme.headerSubtext}>Googleカレンダーより</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenCalendarSelection}
              className={`${theme.headerText} p-2 rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current`}
              aria-label="表示カレンダーの選択"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <Clock />
      </header>
      
      { !hasSelectedCalendars && !isLoading ? (
        <div className="flex-grow flex items-center justify-center">
            <div className={`text-center ${theme.cardBg} rounded-lg shadow-lg p-8 max-w-lg`}>
                <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-4`}>カレンダーが選択されていません</h2>
                <p className={`${theme.textSecondary} mb-6`}>
                ヘッダーの設定アイコンをクリックして、表示したいカレンダーを選択してください。
                </p>
                <button
                    onClick={onOpenCalendarSelection}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center mx-auto ${theme.button} ${theme.buttonHover} ${theme.buttonText}`}
                >
                    <SettingsIcon className="w-5 h-5 mr-2" />
                    カレンダーを選択
                </button>
            </div>
        </div>
      ) : (
        <>
          <AllDayEventsBanner events={allDayEvents} />

          <div className={`relative flex-grow ${theme.cardBg} rounded-lg shadow-lg p-6 mb-6 h-32 sm:h-48 flex items-center justify-center border-gray-200/50 overflow-hidden`}>
            <EventStatusSummary currentEvents={currentEvents} />
          </div>
          
          <main className="flex-grow flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <TimelineOverview events={timedEvents} eventStatuses={eventStatuses} />
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
                    <p className={`${theme.textMuted} text-lg sm:text-xl`}>
                      {isLoading ? '予定を読み込んでいます...' : (events.length > 0 ? '今日の予定はすべて終了しました。' : '今日の予定はありません。')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </>
      )}


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