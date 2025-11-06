import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCheckboxState, setCheckboxState } from '../services/storageService';
import { CheckboxState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const MEMBERS = ['田中', '萩谷', '越川', '佐藤', '野中', '菅澤'];
const INITIAL_STATE: CheckboxState = MEMBERS.reduce((acc, name) => ({ ...acc, [name]: false }), {});
const POLLING_INTERVAL = 5000; // 5 seconds
const HIGHLIGHT_DURATION = 1500; // 1.5 seconds

interface CheckboxFrameProps {
  accessToken: string;
}

const CheckboxFrame: React.FC<CheckboxFrameProps> = ({ accessToken }) => {
  const { theme } = useTheme();
  const [state, setState] = useState<CheckboxState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedFromRemote, setUpdatedFromRemote] = useState<Set<string>>(new Set());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  const fetchData = useCallback(async () => {
    if (isSaving || !accessToken) return;

    try {
      setError(null);
      const storedState = await getCheckboxState(accessToken);
      const validatedState = MEMBERS.reduce((acc, member) => ({
        ...acc,
        [member]: storedState?.[member] ?? false
      }), {});

      const currentState = stateRef.current;
      const changedMembers = new Set<string>();
      MEMBERS.forEach(member => {
        if (currentState[member] !== validatedState[member]) {
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

      setState(validatedState);
    } catch (e) {
      console.error("Error fetching checkbox state:", e);
      if (e instanceof Error) {
        setError(`取得エラー: ${e.message}`);
      } else {
        setError('スプレッドシートから状態を取得できませんでした。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSaving, accessToken]);

  useEffect(() => {
    fetchData(); // Fetch on initial load
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleChange = async (name: string) => {
    if (!accessToken) return;

    setIsSaving(true);
    setError(null);
    const optimisticState = { ...state, [name]: !state[name] };
    setState(optimisticState);

    try {
      const remoteState = await getCheckboxState(accessToken) || INITIAL_STATE;
      const finalState = { ...remoteState, [name]: optimisticState[name] };
      await setCheckboxState(finalState, accessToken);
      setState(finalState);
    } catch (e) {
      console.error("Failed to save checkbox state:", e);
      if (e instanceof Error) {
        setError(`保存エラー: ${e.message}`);
      } else {
        setError('状態の保存に失敗しました。');
      }
      // On error, revert to the last known good state from the server.
      const currentState = await getCheckboxState(accessToken) || INITIAL_STATE;
      setState(currentState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="transition-all overflow-hidden rounded-2xl shadow-2xl"
      style={{
        backgroundColor: theme.name === 'Light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className={`w-full h-full flex items-center justify-center p-4 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {error ? (
          <div className="text-red-500 font-semibold text-sm px-4 text-center">{error}</div>
        ) : (
          <div className="flex items-center justify-around w-full gap-x-4">
            {MEMBERS.map((name) => {
                const isUpdated = updatedFromRemote.has(name);
                const ringColorClass = theme.accentText.replace('text-', 'ring-');
                const checkboxClasses = `h-5 w-5 border-2 rounded-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 ${theme.border} ${theme.accentBg} focus:ring-current ${isUpdated ? `ring-2 ${ringColorClass}` : ''}`;

                return (
                  <label key={name} className="flex items-center cursor-pointer space-x-2">
                    <input
                      type="checkbox"
                      checked={state[name] || false}
                      onChange={() => handleChange(name)}
                      className={checkboxClasses}
                      disabled={isSaving}
                    />
                    <span className={`font-bold text-lg ${theme.textPrimary}`}>
                      {name}
                    </span>
                  </label>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFrame;