
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCheckboxState, setCheckboxState } from '../services/storageService';
import { CheckboxState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const MEMBERS = ['田中', '萩谷', '越川', '佐藤', '野中', '菅澤'];
const INITIAL_STATE: CheckboxState = MEMBERS.reduce((acc, name) => ({ ...acc, [name]: false }), {});
const POLLING_INTERVAL = 5000; // 5 seconds
const HIGHLIGHT_DURATION = 1500; // 1.5 seconds

const CheckboxFrame: React.FC = () => {
  const { theme } = useTheme();
  const [state, setState] = useState<CheckboxState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedFromRemote, setUpdatedFromRemote] = useState<Set<string>>(new Set());

  // Use a ref to hold the current state, so useCallback for fetchData doesn't need 'state' as a dependency.
  // This prevents the polling interval from being reset on every state change.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  const fetchData = useCallback(async () => {
    // ユーザーが状態を保存中は、ポーリングによる上書きを防ぐ
    if (isSaving) return;

    try {
      const storedState = await getCheckboxState();
      // Ensure all members are present in the state
      const validatedState = MEMBERS.reduce((acc, member) => ({
        ...acc,
        [member]: storedState?.[member] ?? false
      }), {});

      // Compare with the current state to detect remote changes
      const currentState = stateRef.current;
      const changedMembers = new Set<string>();
      MEMBERS.forEach(member => {
        if (currentState[member] !== validatedState[member]) {
          changedMembers.add(member);
        }
      });

      // If changes are detected, highlight them
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
    
    // 1. UIを即時反映させるためのオプティミスティック更新
    const optimisticState = { ...state, [name]: !state[name] };
    setState(optimisticState);

    try {
      // 2. 競合を避けるため、書き込む直前に最新の状態を読み込む (Read)
      const remoteState = await getCheckboxState() || INITIAL_STATE;
      
      // 3. 最新の状態にユーザーの意図を反映させる (Modify)
      const finalState = { ...remoteState, [name]: optimisticState[name] };
      
      // 4. 最終的な状態を保存する (Write)
      await setCheckboxState(finalState);
      
      // 5. 保存後、ローカルの状態を保存された最新の状態に同期する
      // これにより、書き込み中に他のデバイスで行われた変更も反映される
      setState(finalState);

    } catch (error) {
      console.error("Failed to save checkbox state:", error);
      // エラー発生時は、サーバーの正しい状態でUIを元に戻す
      const currentState = await getCheckboxState() || INITIAL_STATE;
      setState(currentState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`w-full h-full flex items-center justify-center p-4 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
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
    </div>
  );
};

export default CheckboxFrame;