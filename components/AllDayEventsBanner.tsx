
import React from 'react';
import { CalendarEvent } from '../types';
import CalendarIcon from './icons/CalendarIcon';

interface AllDayEventsBannerProps {
  events: CalendarEvent[];
}

const AllDayEventsBanner: React.FC<AllDayEventsBannerProps> = ({ events }) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg mb-6">
      <div className="flex items-center space-x-3">
        <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
          終日の予定
        </h3>
      </div>
      <ul className="mt-2 list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
        {events.map((event, index) => (
          <li key={index}>{event.summary}</li>
        ))}
      </ul>
    </div>
  );
};

export default AllDayEventsBanner;
