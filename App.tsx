import React, { useState, useCallback } from 'react';
import SetupView from './components/SetupView';
import CalendarView from './components/CalendarView';
import { generateCalendarEvents } from './services/geminiService';
import { CalendarEvent } from './types';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupComplete = useCallback(async (calendarId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, you'd use the calendarId to fetch from Google Calendar API
      // Here, we use our Gemini service to generate mock data.
      console.log('Fetching events for calendar:', calendarId);
      const generatedEvents = await generateCalendarEvents();
      setEvents(generatedEvents);
      setIsSetupComplete(true);
    } catch (err) {
      setError('カレンダーの予定の読み込みに失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setIsSetupComplete(false);
    setEvents([]);
    setError(null);
  }

  return (
    <ThemeProvider>
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      {!isSetupComplete ? (
        <SetupView onSetupComplete={handleSetupComplete} isLoading={isLoading} />
      ) : (
        <CalendarView events={events} onReset={handleReset} />
      )}
    </ThemeProvider>
  );
}

export default App;