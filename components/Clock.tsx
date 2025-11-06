import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Clock: React.FC = () => {
  const { theme } = useTheme();
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
    second: '2-digit',
    hour12: false,
  };

  return (
    <div className="text-center">
      <div className={`font-mono-bold text-4xl sm:text-5xl md:text-7xl tracking-tighter ${theme.headerText}`}>
        {currentTime.toLocaleTimeString('ja-JP', timeOptions)}
      </div>
    </div>
  );
};

export default Clock;