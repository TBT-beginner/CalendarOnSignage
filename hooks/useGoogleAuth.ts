import { useState, useEffect, useCallback, useRef } from 'react';

// Fix: Add types for Google Identity Services to resolve namespace errors.
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        error?: string;
        error_description?: string;
      }
      interface TokenClient {
        requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
      }
      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (tokenResponse: TokenResponse) => void;
      }
    }
  }
}

// IMPORTANT: Replace with your actual Google Cloud Client ID.
// To get a Client ID, follow the instructions here:
// https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
const GOOGLE_CLIENT_ID = '300899135297-dvg6chennc6311advc9f57n9smrqogci.apps.googleusercontent.com';

// The scope determines which parts of the user's data the application can access.
// 'calendar.readonly' allows viewing events on calendars.
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// Extend the Window interface to include the `google` object from the GSI library
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: google.accounts.oauth2.TokenClientConfig) => google.accounts.oauth2.TokenClient;
          revoke: (token: string, done: () => void) => void;
        }
      }
    }
  }
}

export const useGoogleAuth = () => {
  const [tokenClient, setTokenClient] = useState<google.accounts.oauth2.TokenClient | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReAuth, setNeedsReAuth] = useState(false); // New state
  const isSilentRefresh = useRef(false); // To distinguish callbacks

  // Initialize the Google Sign-In client
  useEffect(() => {
    // Poll for the google object to ensure the GSI script has loaded
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        setIsGsiReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isGsiReady) {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            if (isSilentRefresh.current) {
              // A silent refresh failed. This is not a critical error yet.
              // It usually means the user needs to grant consent again.
              console.warn('Silent token refresh failed:', tokenResponse.error_description);
              setNeedsReAuth(true);
              // We don't set a main error and don't log out here.
              // The app will continue to run with stale data until re-auth.
            } else {
              // An interactive sign-in failed. This is a real error.
              setError(tokenResponse.error_description || 'サインイン中にエラーが発生しました。');
              setAccessToken(null);
              setNeedsReAuth(false);
            }
          } else {
            // Success on either silent or interactive sign-in
            setError(null);
            setNeedsReAuth(false);
            setAccessToken(tokenResponse.access_token);
          }
          isSilentRefresh.current = false; // Reset flag after any callback
        },
      });
      setTokenClient(client);
    }
  }, [isGsiReady]);

  const signIn = useCallback(() => {
    setError(null);
    setNeedsReAuth(false);
    if (tokenClient) {
      isSilentRefresh.current = false; // This is an interactive sign-in
      // Prompt the user to select a Google Account and grant access
      tokenClient.requestAccessToken({});
    } else {
        setError('サインインクライアントの準備ができていません。');
    }
  }, [tokenClient]);

  const refreshToken = useCallback(() => {
    if (tokenClient) {
      isSilentRefresh.current = true; // This is a silent refresh attempt
      // Attempt to get a token silently without prompting the user.
      tokenClient.requestAccessToken({ prompt: 'none' });
    }
  }, [tokenClient]);

  const signOut = useCallback(() => {
    if (accessToken) {
      window.google?.accounts?.oauth2.revoke(accessToken, () => {
        setAccessToken(null);
      });
    }
    setAccessToken(null);
    setNeedsReAuth(false);
    setError(null);
  }, [accessToken]);

  return { accessToken, signIn, signOut, isGsiReady, error, refreshToken, needsReAuth, setError };
};