import { CheckboxState } from '../types';

// このサービスは、アプリケーションの状態を永続化するためのものです。
// AI Studio環境で実行されている場合、`window.aistudio.get` および `window.aistudio.set` APIを利用します。
// これにより、プロジェクトに紐付いた共有ストレージにデータが保存され、
// 異なるデバイスやブラウザセッション間での状態の同期が実現されます。
// ローカル環境や、AI Studio APIが利用できない場合は、フォールバックとしてブラウザのlocalStorageを使用します。

// Define the types for AI Studio's persistence API to avoid TypeScript errors.
declare global {
  // FIX: Use a named interface `AIStudio` and augment it. This allows merging
  // with other declarations of `window.aistudio` that also use the `AIStudio` type,
  // resolving the "Subsequent property declarations must have the same type" error.
  interface AIStudio {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const STORAGE_KEY = 'sharedCheckboxState';

/**
 * Retrieves the checkbox state from the persistent storage.
 * It first tries AI Studio's shared storage, and falls back to localStorage if it fails.
 * @returns A promise that resolves to the CheckboxState object or null if not found.
 */
export const getCheckboxState = async (): Promise<CheckboxState | null> => {
  if (window.aistudio?.get) {
    try {
      const data = await window.aistudio.get(STORAGE_KEY);
      // AI Studio's get might return undefined for a key that doesn't exist.
      return (data as CheckboxState) || null;
    } catch (error) {
      console.warn('AI Studio storage "get" failed, falling back to localStorage.', error);
    }
  }

  // Fallback for local development or if aistudio API is unavailable/fails
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : null;
  } catch (error) {
    console.error('Failed to get checkbox state from localStorage:', error);
    return null;
  }
};

/**
 * Saves the checkbox state to the persistent storage.
 * It first tries AI Studio's shared storage, and falls back to localStorage if it fails.
 * @param state The CheckboxState object to save.
 */
export const setCheckboxState = async (state: CheckboxState): Promise<void> => {
  if (window.aistudio?.set) {
    try {
      await window.aistudio.set(STORAGE_KEY, state);
      return; // Success
    } catch (error) {
      console.warn('AI Studio storage "set" failed, falling back to localStorage.', error);
    }
  }

  // Fallback for local development or if aistudio API is unavailable/fails
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to set checkbox state to localStorage:', error);
  }
};
