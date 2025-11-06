import React from 'react';
import { CalendarEvent } from '../types';
import Clock from './Clock';
import TimelineOverview from './TimelineOverview';
import CalendarIcon from './icons/CalendarIcon';
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
  showEndTime: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onSignOut, onOpenCalendarSelection, hasSelectedCalendars, isLoading, showEndTime }) => {
  const { theme } = useTheme();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const todaysEvents = events
    .filter(e => e.date === todayString)
    .sort((a, b) => { // Ensure all-day events come first
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        if (a.isAllDay && b.isAllDay) return a.summary.localeCompare(b.summary);
        return a.startTime.localeCompare(b.startTime);
    });

  const weeklyEvents = events.filter(e => e.date > todayString);
  
  return (
    <div className={`flex flex-col h-screen p-4 sm:p-6 md:p-8 ${theme.fontDisplay}`}>
      <header className={`flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-6 pb-4 ${theme.headerBorder} flex-shrink-0`}>
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div 
              className={`rounded-2xl p-3 ${theme.buttonBorder}`}
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
              className={`p-2 rounded-full transition-all focus:outline-none ${theme.iconButton}`}
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
            <div 
              className={`text-center ${theme.cardBg} ${theme.cardBorder} rounded-3xl p-8 max-w-lg`}
            >
                <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.fontDisplay} mb-4`}>カレンダーが選択されていません</h2>
                <p className={`${theme.textSecondary} mb-6`}>
                ヘッダーの設定アイコンをクリックして、表示したいカレンダーを選択してください。
                </p>
                <button
                    onClick={onOpenCalendarSelection}
                    className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center mx-auto ${theme.button} ${theme.buttonText} ${theme.buttonHover}`}
                >
                    <SettingsIcon className="w-5 h-5 mr-2" />
                    カレンダーを選択
                </button>
            </div>
        </div>
      ) : (
        <main className="flex-grow flex flex-col md:flex-row gap-6 lg:gap-8 min-h-0">
          {/* Left: Today's Schedule */}
          <div className="w-full md:w-3/5 flex flex-col">
            <TimelineOverview events={todaysEvents} showEndTime={showEndTime} />
          </div>
          
          {/* Right: Weekly Schedule */}
          <div className="w-full md:w-2/5 flex flex-col">
              <WeeklyView events={weeklyEvents} isLoading={isLoading} showEndTime={showEndTime} />
          </div>
        </main>
      )}


      <footer className="mt-auto pt-6 text-center flex-shrink-0">
          <button 
            onClick={onSignOut}
            className={`${theme.textMuted} hover:${theme.textPrimary} transition text-sm font-semibold`}
          >
            サインアウト
          </button>
      </footer>
      
      <iframe
        src={`/checkbox-frame.html?theme=${theme.name.toLowerCase()}`}
        title="共有チェックボックス"
        className="fixed bottom-5 left-5 w-[640px] h-[80px] border-none rounded-2xl shadow-2xl transition-all"
        style={{ 
          backgroundColor: theme.name === 'Light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />
    </div>
  );
};

export default CalendarView;