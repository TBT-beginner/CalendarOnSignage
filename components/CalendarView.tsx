
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  accessToken: string | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onSignOut, onOpenCalendarSelection, hasSelectedCalendars, isLoading, showEndTime, accessToken }) => {
  const { theme } = useTheme();

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem('checkboxFramePosition');
      if (savedPosition) {
        const parsed = JSON.parse(savedPosition);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to parse frame position from localStorage", e);
    }
  }, []);

  const handleDragMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const newX = dragOffset.current.x - e.clientX;
    const newY = dragOffset.current.y - e.clientY;
    setPosition({ x: newX, y: newY });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const newX = dragOffset.current.x - touch.clientX;
    const newY = dragOffset.current.y - touch.clientY;
    setPosition({ x: newX, y: newY });
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleDragEnd);
  }, [handleDragMove, handleTouchMove]);

  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('checkboxFramePosition', JSON.stringify(position));
    }
  }, [position, isDragging]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragOffset.current = {
      x: clientX + position.x,
      y: clientY + position.y,
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);
  }, [position, handleDragMove, handleDragEnd, handleTouchMove]);
  
  // Listen for messages from the iframe (drag start, ready signal)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return; // Ignore messages from other sources
      }

      if (event.data.type === 'iframe-drag-start' && event.data.payload) {
        const { clientX, clientY } = event.data.payload;
        handleDragStart(clientX, clientY);
      } else if (event.data.type === 'iframe-ready') {
        setIframeReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleDragStart]);

  // Send the auth token to the iframe when both the iframe is ready and the token is available
  useEffect(() => {
    if (iframeReady && accessToken && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'auth-token', token: accessToken },
        '*' // Use a specific origin in production
      );
    }
  }, [iframeReady, accessToken]);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const todaysEvents = events
    .filter(e => e.date === todayString)
    .sort((a, b) => {
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
      
      <div
        ref={frameRef}
        className="fixed z-20"
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
         <iframe
          ref={iframeRef}
          src="/checkbox-frame.html"
          title="メンバー在席確認"
          className={`w-[26rem] h-[25rem] border-none transition-opacity duration-300 ${isDragging ? 'pointer-events-none opacity-75' : 'opacity-100'}`}
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
    </div>
  );
};

export default CalendarView;