import React from 'react';
import ReactDOM from 'react-dom/client';
import CheckboxFrame from './components/CheckboxFrame';
import { ThemeProvider } from './contexts/ThemeContext';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <CheckboxFrame />
    </ThemeProvider>
  </React.StrictMode>
);
