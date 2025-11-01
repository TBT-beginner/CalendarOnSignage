import React, { useState, useEffect, useCallback } from 'react';
import SetupView from './components/SetupView';
import CalendarView from './components/CalendarView';
import { fetchGoogleCalendarEvents, fetchCalendarList } from './services/googleCalendarService';
import { CalendarEvent, CalendarListEntry } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import CalendarSelectionModal from './components/CalendarSelectionModal';

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [availableCalendars, setAvailableCalendars] = useState<CalendarListEntry[]>([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  
  const auth = useGoogleAuth();

  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('selectedCalendarIds');
      if (savedIds) {
        const parsedIds = JSON.parse(savedIds);
        if (Array.isArray(parsedIds)) {
          setSelectedCalendarIds(parsedIds);
        } else {
          setSelectedCalendarIds([]);
        }
      } else {
        setSelectedCalendarIds([]);
      }
    } catch (error) {
      console.error("Failed to parse selected calendars from localStorage", error);
      setSelectedCalendarIds([]);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    if (auth.accessToken && selectedCalendarIds.length > 0) {
      setIsLoading(true);
      setFetchError(null);
      try {
        const fetchedEvents = await fetchGoogleCalendarEvents(auth.accessToken, selectedCalendarIds);
        setEvents(fetchedEvents);
      } catch (e) {
        if (e instanceof Error) {
          setFetchError(e.message);
          if (e.message.includes('認証')) {
              auth.signOut();
          }
        } else {
          setFetchError('不明なエラーが発生しました。');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setEvents([]);
      setIsLoading(false);
    }
  }, [auth.accessToken, selectedCalendarIds, auth.signOut]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSignOut = () => {
    auth.signOut();
    setEvents([]);
    setFetchError(null);
    setSelectedCalendarIds([]);
    localStorage.removeItem('selectedCalendarIds');
  };

  const handleOpenCalendarSelection = async () => {
    if (!auth.accessToken) return;
    try {
        const calendars = await fetchCalendarList(auth.accessToken);
        setAvailableCalendars(calendars);
        setIsCalendarModalOpen(true);
    } catch(e) {
        if (e instanceof Error) setFetchError(e.message);
    }
  };

  const handleSaveSelectedCalendars = (ids: string[]) => {
    setSelectedCalendarIds(ids);
    localStorage.setItem('selectedCalendarIds', JSON.stringify(ids));
    setIsCalendarModalOpen(false);
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
        <>
          <CalendarView
            events={events}
            onSignOut={handleSignOut}
            onOpenCalendarSelection={handleOpenCalendarSelection}
            hasSelectedCalendars={selectedCalendarIds.length > 0}
            isLoading={isLoading}
          />
          <CalendarSelectionModal
            isOpen={isCalendarModalOpen}
            onClose={() => setIsCalendarModalOpen(false)}
            availableCalendars={availableCalendars}
            selectedIds={selectedCalendarIds}
            onSave={handleSaveSelectedCalendars}
          />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;