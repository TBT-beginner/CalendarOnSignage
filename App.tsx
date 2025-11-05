import React, { useState, useEffect, useCallback } from 'react';
import SetupView from './components/SetupView';
import CalendarView from './components/CalendarView';
import { fetchGoogleCalendarEvents, fetchCalendarList } from './services/googleCalendarService';
import { generateSampleCalendarEvents } from './services/geminiService';
import { CalendarEvent, CalendarListEntry } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import CalendarSelectionModal from './components/CalendarSelectionModal';
import ReAuthModal from './components/ReAuthModal';

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [availableCalendars, setAvailableCalendars] = useState<CalendarListEntry[]>([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [showEndTime, setShowEndTime] = useState(true);
  
  // New state for Demo Mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const auth = useGoogleAuth();

  useEffect(() => {
    if(auth.needsReAuth) {
      setShowReAuthModal(true);
    }
  }, [auth.needsReAuth]);


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

      const savedShowEndTime = localStorage.getItem('showEndTime');
      if (savedShowEndTime !== null) {
        setShowEndTime(JSON.parse(savedShowEndTime));
      }

    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      setSelectedCalendarIds([]);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    if (isDemoMode) return; // Don't fetch from Google in demo mode
    if (auth.accessToken && selectedCalendarIds.length > 0) {
      setIsLoading(true);
      try {
        const fetchedEvents = await fetchGoogleCalendarEvents(auth.accessToken, selectedCalendarIds);
        setEvents(fetchedEvents);
      } catch (e) {
        if (e instanceof Error && e.message.includes('認証')) {
          console.log('Authentication error detected, attempting refresh...');
          auth.refreshToken();
        } else {
          console.error("Failed to fetch calendar events:", e);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setEvents([]);
      setIsLoading(false);
    }
  }, [auth.accessToken, selectedCalendarIds, auth.refreshToken, isDemoMode]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Automatically refresh events every 15 minutes
  useEffect(() => {
    if (isDemoMode || !auth.accessToken || selectedCalendarIds.length === 0) {
      return; // Don't start the timer in demo mode, or if not logged in, or no calendars are selected
    }

    const intervalId = setInterval(() => {
      fetchEvents();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(intervalId);
  }, [auth.accessToken, selectedCalendarIds, fetchEvents, isDemoMode]);

  const handleStartDemo = useCallback(async () => {
    setIsLoadingDemo(true);
    auth.setError(null);
    try {
      const demoEvents = await generateSampleCalendarEvents();
      setEvents(demoEvents);
      setIsDemoMode(true);
    } catch (error) {
      console.error("Failed to start demo:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      auth.setError(`デモデータの生成に失敗しました: ${errorMessage}`);
    } finally {
      setIsLoadingDemo(false);
    }
  }, [auth]);

  const handleSignOut = () => {
    auth.signOut();
    setEvents([]);
    setSelectedCalendarIds([]);
    localStorage.removeItem('selectedCalendarIds');
  };
  
  const handleExitDemo = () => {
    setIsDemoMode(false);
    setEvents([]);
    auth.setError(null);
  };

  const onSignOutOrExitDemo = isDemoMode ? handleExitDemo : handleSignOut;

  const handleReAuthConfirm = () => {
    setShowReAuthModal(false);
    auth.signIn();
  };

  const handleReAuthCancel = () => {
    setShowReAuthModal(false);
    auth.signOut();
  };


  const handleOpenCalendarSelection = async () => {
    if (!auth.accessToken || isDemoMode) return;
    try {
        const calendars = await fetchCalendarList(auth.accessToken);
        setAvailableCalendars(calendars);
        setIsCalendarModalOpen(true);
    } catch(e) {
        if (e instanceof Error) {
            if (e.message.includes('認証')) {
                auth.refreshToken();
            }
        }
    }
  };

  const handleSaveSelectedCalendars = (ids: string[]) => {
    setSelectedCalendarIds(ids);
    localStorage.setItem('selectedCalendarIds', JSON.stringify(ids));
    setIsCalendarModalOpen(false);
  };
  
  const handleToggleShowEndTime = () => {
    setShowEndTime(prev => {
      const newValue = !prev;
      localStorage.setItem('showEndTime', JSON.stringify(newValue));
      return newValue;
    });
  };

  if (!auth.accessToken && !isDemoMode) {
    return (
      <ThemeProvider>
        <SetupView
          onSignIn={auth.signIn}
          isGsiReady={auth.isGsiReady}
          error={auth.error}
          isLoading={isLoadingDemo || !auth.isGsiReady}
          onStartDemo={handleStartDemo}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <CalendarView
        events={events}
        onSignOut={onSignOutOrExitDemo}
        onOpenCalendarSelection={handleOpenCalendarSelection}
        hasSelectedCalendars={selectedCalendarIds.length > 0}
        isLoading={isLoading || isLoadingDemo}
        showEndTime={showEndTime}
        isDemoMode={isDemoMode}
      />
      <CalendarSelectionModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        availableCalendars={availableCalendars}
        selectedIds={selectedCalendarIds}
        onSave={handleSaveSelectedCalendars}
        showEndTime={showEndTime}
        onToggleShowEndTime={handleToggleShowEndTime}
      />
      <ReAuthModal 
        isOpen={showReAuthModal}
        onConfirm={handleReAuthConfirm}
        onCancel={handleReAuthCancel}
      />
    </ThemeProvider>
  );
}

export default App;