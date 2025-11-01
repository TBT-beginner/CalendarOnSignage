
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="text-5xl font-bold tracking-tighter text-gray-800 dark:text-gray-200">
      {time.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </div>
  );
};

export default Clock;
