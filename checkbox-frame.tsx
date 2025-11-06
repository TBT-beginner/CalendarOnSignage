
import React from 'react';
import ReactDOM from 'react-dom/client';
import CheckboxFrame from './components/CheckboxFrame';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useGoogleAuth } from './hooks/useGoogleAuth';

// Fix: Create a wrapper component to handle authentication.
// The CheckboxFrame component requires an `accessToken` to function, but this entry point
// was not providing it. This `CheckboxFrameApp` wrapper uses the `useGoogleAuth` hook
// to manage user authentication. It displays a sign-in button if the user is not logged in,
// and once an access token is available, it renders the CheckboxFrame with the required prop.
const CheckboxFrameApp: React.FC = () => {
  const auth = useGoogleAuth();
  const { theme } = useTheme();

  if (!auth.accessToken) {
    // If not authenticated, show a simple sign-in UI.
    return (
      <div className={`flex flex-col items-center justify-center h-full p-4 ${theme.textPrimary}`}>
        {auth.error && <p className="text-red-500 mb-4 text-center">Error: {auth.error}</p>}
        <button
          onClick={auth.signIn}
          disabled={!auth.isGsiReady}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${theme.button} ${theme.buttonText} ${theme.buttonHover} disabled:opacity-75`}
        >
          {auth.isGsiReady ? 'Sign in with Google' : 'Initializing...'}
        </button>
      </div>
    );
  }

  // Once authenticated, render the actual CheckboxFrame.
  return <CheckboxFrame accessToken={auth.accessToken} />;
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <CheckboxFrameApp />
    </ThemeProvider>
  </React.StrictMode>
);
