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
  
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const auth = useGoogleAuth();

  useEffect(() => {
    if(auth.needsReAuth) {
      setShowReAuthModal(true);
    }
  }, [auth.needsReAuth]);


  useEffect(() => {
    try {
      // アプリ起動時にキャッシュを確認
      const cachedEventsStr = localStorage.getItem('cachedCalendarEvents');
      const lastFetchTimestampStr = localStorage.getItem('lastFetchTimestamp');
      const isDemoActive = localStorage.getItem('isDemoModeActive') === 'true';

      if (cachedEventsStr && lastFetchTimestampStr) {
        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (now - parseInt(lastFetchTimestampStr, 10) < twentyFourHours) {
          console.log("24時間以内のキャッシュデータを読み込みます。");
          setEvents(JSON.parse(cachedEventsStr));
          if (isDemoActive) {
            setIsDemoMode(true);
          }
          setIsLoading(false);
        }
      }

      const savedIds = localStorage.getItem('selectedCalendarIds');
      if (savedIds) {
        setSelectedCalendarIds(JSON.parse(savedIds));
      }

      const savedShowEndTime = localStorage.getItem('showEndTime');
      if (savedShowEndTime !== null) {
        setShowEndTime(JSON.parse(savedShowEndTime));
      }

    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      setSelectedCalendarIds([]);
    } finally {
      setIsInitialLoad(false);
    }
  }, []); // このEffectはマウント時に一度だけ実行

  const fetchEvents = useCallback(async () => {
    if (isDemoMode) return;
    if (auth.accessToken && selectedCalendarIds.length > 0) {
      setIsLoading(true);
      try {
        const fetchedEvents = await fetchGoogleCalendarEvents(auth.accessToken, selectedCalendarIds);
        setEvents(fetchedEvents);
        localStorage.setItem('cachedCalendarEvents', JSON.stringify(fetchedEvents));
        localStorage.setItem('lastFetchTimestamp', new Date().getTime().toString());
        localStorage.removeItem('isDemoModeActive');
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
      if (auth.accessToken) { // サインイン済みだがカレンダー未選択の場合
        setEvents([]);
      }
      setIsLoading(false);
    }
  }, [auth.accessToken, selectedCalendarIds, auth.refreshToken, isDemoMode]);

  useEffect(() => {
    if (isInitialLoad) return; // 起動時のキャッシュ読み込み処理と競合させない
    fetchEvents();
  }, [fetchEvents, isInitialLoad]);

  const handleStartDemo = useCallback(async () => {
    setIsLoadingDemo(true);
    auth.setError(null);
    try {
      const demoEvents = await generateSampleCalendarEvents();
      setEvents(demoEvents);
      setIsDemoMode(true);
      localStorage.setItem('cachedCalendarEvents', JSON.stringify(demoEvents));
      localStorage.setItem('lastFetchTimestamp', new Date().getTime().toString());
      localStorage.setItem('isDemoModeActive', 'true');
    } catch (error) {
      console.error("Failed to start demo:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      auth.setError(`デモデータの生成に失敗しました: ${errorMessage}`);
    } finally {
      setIsLoadingDemo(false);
    }
  }, [auth]);

  const clearCache = () => {
    localStorage.removeItem('cachedCalendarEvents');
    localStorage.removeItem('lastFetchTimestamp');
    localStorage.removeItem('isDemoModeActive');
  }

  const handleSignOut = () => {
    auth.signOut();
    setEvents([]);
    setSelectedCalendarIds([]);
    localStorage.removeItem('selectedCalendarIds');
    clearCache();
  };
  
  const handleExitDemo = () => {
    setIsDemoMode(false);
    setEvents([]);
    auth.setError(null);
    clearCache();
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