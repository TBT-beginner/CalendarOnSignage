
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import CheckboxFrame from './components/CheckboxFrame';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: Check the origin in a real application
      // if (event.origin !== 'https://your-app-origin.com') return;

      if (event.data && event.data.type === 'auth-token' && typeof event.data.token === 'string') {
        setAccessToken(event.data.token);
        setError(null);
      } else if (event.data && event.data.type === 'auth-error') {
        setError(event.data.message || 'Authentication error from parent window.');
      }
    };

    window.addEventListener('message', handleMessage);

    // Let the parent window know that the iframe is ready to receive messages.
    window.parent.postMessage({ type: 'iframe-ready' }, '*');
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // While waiting for the access token, we render a transparent container
  // to prevent any visual flicker before the actual content is ready.
  if (!accessToken) {
    if (error) {
      return (
        <div 
          className="flex items-center justify-center h-full p-4 rounded-2xl"
          style={{
            backgroundColor: theme.name === 'Light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-red-500 text-center font-semibold">{error}</p>
        </div>
      );
    }
    return null; // Render nothing until token is received or an error occurs
  }

  return <CheckboxFrame accessToken={accessToken} />;
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
