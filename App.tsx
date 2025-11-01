import React, { useState, useEffect } from 'react';
import SetupView from './components/SetupView';
import CalendarView from './components/CalendarView';
import { fetchGoogleCalendarEvents } from './services/googleCalendarService';
import { CalendarEvent } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { useGoogleAuth } from './hooks/useGoogleAuth';

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const auth = useGoogleAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      if (auth.accessToken) {
        setIsLoading(true);
        setFetchError(null);
        try {
          const fetchedEvents = await fetchGoogleCalendarEvents(auth.accessToken);
          setEvents(fetchedEvents);
        } catch (e) {
          if (e instanceof Error) {
            setFetchError(e.message);
            // If fetch fails due to auth, sign out to force re-authentication
            if (e.message.includes('認証')) {
                auth.signOut();
            }
          } else {
            setFetchError('不明なエラーが発生しました。');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();
  }, [auth.accessToken, auth.signOut]);

  const handleSignOut = () => {
    auth.signOut();
    setEvents([]);
    setFetchError(null);
  };

  const combinedError = auth.error || fetchError;

  return (
    <ThemeProvider>
      {!auth.accessToken ? (
        <SetupView
          onSignIn={auth.signIn}
          isGsiReady={auth.isGsiReady}
          error={combinedError}
          isLoading={isLoading}
        />
      ) : (
        <CalendarView events={events} onSignOut={handleSignOut} />
      )}
    </ThemeProvider>
  );
}

export default App;