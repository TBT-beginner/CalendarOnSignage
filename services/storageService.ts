import { CheckboxState } from '../types';

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
 * @returns A promise that resolves to the CheckboxState object or null if not found.
 */
export const getCheckboxState = async (): Promise<CheckboxState | null> => {
  try {
    if (window.aistudio?.get) {
      const data = await window.aistudio.get(STORAGE_KEY);
      return data as CheckboxState | null;
    }
    // Fallback for local development if aistudio API is not available
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : null;
  } catch (error) {
    console.error('Failed to get checkbox state:', error);
    return null;
  }
};

/**
 * Saves the checkbox state to the persistent storage.
 * @param state The CheckboxState object to save.
 */
export const setCheckboxState = async (state: CheckboxState): Promise<void> => {
  try {
    if (window.aistudio?.set) {
      await window.aistudio.set(STORAGE_KEY, state);
    } else {
      // Fallback for local development
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error('Failed to set checkbox state:', error);
  }
};
