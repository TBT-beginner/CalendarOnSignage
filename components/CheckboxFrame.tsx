import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCheckboxState, setCheckboxState, SPREADSHEET_ID } from '../services/storageService';
import { CheckboxState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const MEMBERS = ['田中', '萩谷', '越川', '佐藤', '野中', '菅澤'];

const createInitialState = (): CheckboxState => {
  return MEMBERS.reduce((acc, name) => {
    acc[name] = { isPresent: false, comment: '' };
    return acc;
  }, {} as CheckboxState);
};

const POLLING_INTERVAL = 5000;
const HIGHLIGHT_DURATION = 1500;
const SAVE_DEBOUNCE_MS = 1000;

interface CheckboxFrameProps {
  accessToken: string;
}

const Spinner: React.FC<{className?: string}> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const CheckboxFrame: React.FC<CheckboxFrameProps> = ({ accessToken }) => {
  const { theme } = useTheme();
  const [state, setState] = useState<CheckboxState>(createInitialState());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedFromRemote, setUpdatedFromRemote] = useState<Set<string>>(new Set());
  
  const stateRef = useRef(state);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  const fetchData = useCallback(async (isInitial = false) => {
    if (isSaving || !accessToken) return;

    try {
      setError(null);
      const storedState = await getCheckboxState(accessToken);
      const validatedState: CheckboxState = MEMBERS.reduce((acc, member) => {
        acc[member] = {
          isPresent: storedState?.[member]?.isPresent ?? false,
          comment: storedState?.[member]?.comment ?? ''
        };
        return acc;
      }, {} as CheckboxState);

      if (!isInitial) {
          const currentState = stateRef.current;
          const changedMembers = new Set<string>();
          MEMBERS.forEach(member => {
            if (currentState[member].isPresent !== validatedState[member].isPresent || currentState[member].comment !== validatedState[member].comment) {
              changedMembers.add(member);
            }
          });

          if (changedMembers.size > 0) {
            setUpdatedFromRemote(prev => new Set([...prev, ...changedMembers]));
            setTimeout(() => {
              setUpdatedFromRemote(prev => {
                const newSet = new Set(prev);
                changedMembers.forEach(member => newSet.delete(member));
                return newSet;
              });
            }, HIGHLIGHT_DURATION);
          }
      }

      setState(validatedState);
    } catch (e) {
      console.error("Error fetching state:", e);
      if (e instanceof Error) setError(`取得エラー: ${e.message}`);
      else setError('スプレッドシートから状態を取得できませんでした。');
    } finally {
      if(isInitial) setIsLoading(false);
    }
  }, [isSaving, accessToken]);

  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const saveState = useCallback(async (newState: CheckboxState) => {
      if (!accessToken) return;
      setIsSaving(true);
      setError(null);
      try {
        await setCheckboxState(newState, accessToken);
        // After successful save, refresh data to ensure consistency
        await fetchData(false);
      } catch (e) {
        console.error("Failed to save state:", e);
        if (e instanceof Error) setError(`保存エラー: ${e.message}`);
        else setError('状態の保存に失敗しました。');
        // Revert on error
        const currentState = await getCheckboxState(accessToken) || createInitialState();
        setState(currentState);
      } finally {
        setIsSaving(false);
      }
  }, [accessToken, fetchData]);

  const handleStatusChange = (name: string) => {
    const newState = {
      ...state,
      [name]: {
        ...state[name],
        isPresent: !state[name].isPresent
      }
    };
    setState(newState);
    saveState(newState);
  };

  const handleCommentChange = (name: string, comment: string) => {
    const newState = {
        ...state,
        [name]: {
            ...state[name],
            comment: comment
        }
    };
    setState(newState);

    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
        saveState(newState);
    }, SAVE_DEBOUNCE_MS);
  };

  const renderError = () => (
     <div className={`p-4 font-semibold text-sm text-center ${theme.name === 'Light' ? 'text-red-600' : 'text-red-400'}`}>
        <p className={`font-bold text-base ${theme.name === 'Light' ? 'text-red-700' : 'text-red-300'}`}>スプレッドシートエラー</p>
        <p className="text-xs mt-1">状態の読み書きに失敗しました。</p>
        <p className={`text-xs mt-2 p-1 rounded break-all font-mono ${theme.name === 'Light' ? 'bg-gray-100 text-gray-700' : 'bg-black/20 text-gray-300'}`}>{error}</p>
        <p className="text-xs mt-2">
            <a href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`} target="_blank" rel="noopener noreferrer" className="underline">
                スプレッドシート
            </a>
            への編集権限があるか確認してください。
        </p>
    </div>
  );
  
  if (isLoading) {
    return (
      <div
        className={`w-full flex items-center justify-center p-8 rounded-2xl shadow-lg ${theme.cardBg} ${theme.cardBorder}`}
        style={{ minHeight: '10rem' }}
      >
        <Spinner className={`h-8 w-8 ${theme.textPrimary}`} />
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl shadow-lg ${theme.cardBg} ${theme.cardBorder}`}
    >
      <div className="p-4 md:p-6 relative">
        {isSaving && <Spinner className={`absolute h-5 w-5 ${theme.textPrimary} top-4 right-4 md:top-6 md:right-6`} />}
        {error ? (
          renderError()
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {MEMBERS.map((name) => {
                const status = state[name];
                const isUpdated = updatedFromRemote.has(name);
                const ringColorClass = theme.accentText.replace('text-', 'ring-');
                
                const plateBgColor = status.isPresent
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-gray-500 hover:bg-gray-600';
                
                const cardBg = theme.name === 'Light' ? 'bg-gray-100/80' : 'bg-gray-800/80';

                return (
                    <div 
                        key={name} 
                        className={`flex flex-col rounded-lg shadow-md transition-all duration-200 overflow-hidden border ${theme.border} ${cardBg}`}
                    >
                       <button
                            type="button"
                            onClick={() => handleStatusChange(name)}
                            className={`w-full h-14 md:h-16 rounded-t-md font-bold text-base md:text-lg text-white transition-all duration-200 relative transform focus:outline-none ${plateBgColor} ${isUpdated ? `ring-4 ${ringColorClass}` : 'ring-0'}`}
                       >
                            <span className={`absolute top-2 left-2 h-3 w-3 rounded-full ${status.isPresent ? 'bg-green-300' : 'bg-gray-400'}`}></span>
                            {name}
                       </button>
                       <div className="p-1.5 h-20">
                         <textarea
                            value={status.comment}
                            onChange={(e) => handleCommentChange(name, e.target.value)}
                            placeholder="不在理由..."
                            className={`w-full h-full p-1.5 rounded-md text-sm border-2 transition-opacity duration-300 focus:outline-none resize-none ${theme.border} ${theme.textPrimary} ${!status.isPresent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            style={{ backgroundColor: 'transparent' }}
                            disabled={status.isPresent}
                         />
                       </div>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFrame;