import React, { useState, useCallback } from 'react';
import SetupView from './components/SetupView';
import CalendarView from './components/CalendarView';
import { fetchCalendarEvents } from './services/geminiService';
import { CalendarEvent } from './types';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEvents = await fetchCalendarEvents();
      setEvents(fetchedEvents);
      setIsSetupComplete(true);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('不明なエラーが発生しました。');
      }
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
      {!isSetupComplete ? (
        <SetupView
          onSetupComplete={handleSetupComplete}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <CalendarView events={events} onReset={handleReset} />
      )}
    </ThemeProvider>
  );
}

export default App;
