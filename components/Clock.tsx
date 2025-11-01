import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Clock: React.FC = () => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return (
    <div className="w-full sm:w-auto text-center sm:text-right">
      <div className={`font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter ${theme.headerText}`}>
        {currentTime.toLocaleTimeString('ja-JP', timeOptions)}
      </div>
      <div className={`text-lg sm:text-xl md:text-3xl ${theme.headerSubtext}`}>
        {currentTime.toLocaleDateString('ja-JP', dateOptions)}
      </div>
    </div>
  );
};

export default Clock;