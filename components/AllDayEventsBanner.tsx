import React from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import InformationIcon from './icons/InformationIcon';

interface AllDayEventsBannerProps {
  events: CalendarEvent[];
}

const AllDayEventsBanner: React.FC<AllDayEventsBannerProps> = ({ events }) => {
  const { theme } = useTheme();

  if (events.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full ${theme.accentBg} text-white p-3 flex items-center flex-wrap gap-x-6 gap-y-1 rounded-xl`}
    >
      <InformationIcon className="w-5 h-5 flex-shrink-0 mr-2" />
      {events.map((event, index) => (
        <span key={index} className="font-semibold text-base whitespace-nowrap">
          {event.summary}
        </span>
      ))}
    </div>
  );
};

export default AllDayEventsBanner;