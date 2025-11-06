import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getCheckboxState, setCheckboxState, SPREADSHEET_ID } from '../services/storageService';
import { CheckboxState, MemberStatus } from '../types';
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

const CommentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H4.25zm0 4a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H4.25zM4.25 13.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5H4.25z" clipRule="evenodd" />
  </svg>
);

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
  const [selectedForComment, setSelectedForComment] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  
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

    if (!newState[name].isPresent) {
        setSelectedForComment(name);
    } else if (selectedForComment === name) {
        setSelectedForComment(null);
    }

    saveState(newState);
  };

  const handleCommentChange = (comment: string) => {
    if (!selectedForComment) return;

    const newState = {
        ...state,
        [selectedForComment]: {
            ...state[selectedForComment],
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

  const currentComment = useMemo(() => {
    return selectedForComment ? state[selectedForComment]?.comment ?? '' : '';
  }, [selectedForComment, state]);


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

  return (
    <div
      className="transition-all overflow-hidden rounded-2xl shadow-2xl"
      style={{
        backgroundColor: theme.name === 'Light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className={`p-4 transition-opacity duration-300 relative ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {isSaving && <Spinner className={`absolute top-3 right-3 h-5 w-5 ${theme.textPrimary}`} />}
        {error ? (
          renderError()
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-3">
                {MEMBERS.map((name) => {
                    const status = state[name];
                    const isUpdated = updatedFromRemote.has(name);
                    const ringColorClass = theme.accentText.replace('text-', 'ring-');
                    
                    const plateBgColor = status.isPresent
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-gray-500 hover:bg-gray-600';

                    return (
                        <div key={name} className="relative" onMouseEnter={() => setHoveredMember(name)} onMouseLeave={() => setHoveredMember(null)}>
                           <button
                                type="button"
                                onClick={() => handleStatusChange(name)}
                                className={`w-full h-16 rounded-lg font-bold text-lg text-white transition-all duration-200 relative shadow-md transform hover:scale-105 focus:outline-none ${plateBgColor} ${isUpdated ? `ring-4 ${ringColorClass}` : 'ring-0'}`}
                           >
                                <span className={`absolute top-2 left-2 h-3 w-3 rounded-full ${status.isPresent ? 'bg-green-300' : 'bg-gray-400'}`}></span>
                                {name}
                                {!status.isPresent && status.comment && (
                                    <CommentIcon className="absolute bottom-1.5 right-1.5 h-4 w-4 text-white/70" />
                                )}
                           </button>
                           {hoveredMember === name && !status.isPresent && status.comment && (
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 opacity-90 transition-opacity">
                                   {status.comment}
                               </div>
                           )}
                        </div>
                    );
                })}
            </div>

            <div className={`mt-3 transition-all duration-300 h-24 ${selectedForComment ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
               {selectedForComment && (
                 <div>
                    <label htmlFor="comment" className={`block text-sm font-bold mb-1 ${theme.textPrimary}`}>
                       {selectedForComment}さんの不在理由:
                    </label>
                    <textarea
                        id="comment"
                        value={currentComment}
                        onChange={(e) => handleCommentChange(e.target.value)}
                        placeholder="例: 外出 (15時まで)"
                        className={`w-full p-2 rounded-md text-sm border-2 transition-colors focus:outline-none resize-none ${theme.cardBorder} ${theme.textPrimary}`}
                        style={{ backgroundColor: 'transparent' }}
                        rows={2}
                    />
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFrame;