import React, { useState, useEffect, useCallback } from 'react';
import { getCheckboxState, setCheckboxState } from '../services/storageService';
import { CheckboxState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const MEMBERS = ['田中', '萩谷', '越川', '佐藤', '野中', '菅澤'];
const INITIAL_STATE: CheckboxState = MEMBERS.reduce((acc, name) => ({ ...acc, [name]: false }), {});
const POLLING_INTERVAL = 5000; // 5 seconds

const CheckboxFrame: React.FC = () => {
  const { theme } = useTheme();
  const [state, setState] = useState<CheckboxState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fetchData = useCallback(async () => {
    // Do not refresh if user is currently saving to avoid conflicts
    if (isSaving) return;

    try {
      const storedState = await getCheckboxState();
      // Ensure all members are present in the state
      const validatedState = MEMBERS.reduce((acc, member) => ({
        ...acc,
        [member]: storedState?.[member] ?? false
      }), {});

      setState(validatedState);
    } catch (error) {
      console.error("Error fetching checkbox state:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isSaving]);

  useEffect(() => {
    fetchData(); // Fetch on initial load
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleChange = async (name: string) => {
    setIsSaving(true);
    const newState = { ...state, [name]: !state[name] };
    setState(newState); // Optimistic UI update

    try {
      await setCheckboxState(newState);
    } catch (error) {
      console.error("Failed to save checkbox state:", error);
      // Optional: Revert state on error by refetching
      await fetchData();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`w-full h-full flex items-center justify-center p-4 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex items-center justify-around w-full gap-x-4">
        {MEMBERS.map((name) => (
          <label key={name} className="flex items-center cursor-pointer space-x-2">
            <input
              type="checkbox"
              checked={state[name] || false}
              onChange={() => handleChange(name)}
              className={`h-5 w-5 border-2 rounded-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition ${theme.border} ${theme.accentBg} focus:ring-current`}
              disabled={isSaving}
            />
            <span className={`font-bold text-lg ${theme.textPrimary}`}>
              {name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxFrame;