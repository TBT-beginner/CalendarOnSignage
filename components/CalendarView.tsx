
import React, { useMemo } from 'react';
import { CalendarEvent } from '../types';
import Clock from './Clock';
import AllDayEventsBanner from './AllDayEventsBanner';
import TimelineOverview from './TimelineOverview';
import EventStatusSummary from './EventStatusSummary';
import ThemeToggle from './ThemeToggle';

interface CalendarViewProps {
  events: CalendarEvent[];
  onSignOut: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onSignOut }) => {
  const allDayEvents = useMemo(() => events.filter(e => e.isAllDay), [events]);
  const timedEvents = useMemo(() => events.filter(e => !e.isAllDay), [events]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <h1 className="text-xl font-bold">今日のタイムライン</h1>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                    <button
                        onClick={onSignOut}
                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                    >
                        サインアウト
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 flex flex-col justify-center items-center lg:items-start">
              <Clock />
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="lg:col-span-2">
              <EventStatusSummary events={events} />
            </div>
          </div>
          
          <AllDayEventsBanner events={allDayEvents} />

          <TimelineOverview events={timedEvents} />
        </div>
      </main>
    </div>
  );
};

export default CalendarView;
