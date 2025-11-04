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
    hour12: false,
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日 ${weekday}曜日`;
  };

  return (
    <div className="w-full sm:w-auto text-center sm:text-right">
      <div className={`${theme.fontDisplay} text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter ${theme.headerText}`}>
        {currentTime.toLocaleTimeString('ja-JP', timeOptions)}
      </div>
      <div className={`text-lg sm:text-xl md:text-3xl ${theme.headerSubtext}`}>
        {formatDate(currentTime)}
      </div>
    </div>
  );
};

export default Clock;
