
import React from 'react';
import { CalendarEvent } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import InformationIcon from './icons/InformationIcon';

interface AllDayEventsBannerProps {
  events: CalendarEvent[];
}

const AllDayEventsBanner: React.FC<AllDayEventsBannerProps> = ({ events }) => {
  const theme = useTheme();

  if (events.length === 0) {
    return null;
  }

  const marqueeDuration = events.length * 10;

  const bannerBg = theme.name === 'Default' ? 'bg-orange-600' : theme.accentBg;
  const bannerText = theme.name === 'Default' ? 'text-white' : theme.buttonText;

  return (
    <div className={`w-full ${bannerBg} ${bannerText} rounded-lg shadow-md p-3 mb-6 overflow-hidden flex items-center`}>
      <div className="flex-shrink-0 mr-4">
        <InformationIcon className="w-6 h-6" />
      </div>
      <div className="flex-grow relative h-6 overflow-hidden">
        {events.length === 1 ? (
          <div className="whitespace-nowrap font-bold text-lg">
            {events[0].summary}
          </div>
        ) : (
          <div className="absolute flex" style={{ animation: `marquee ${marqueeDuration}s linear infinite` }}>
            {[...events, ...events].map((event, index) => (
              <span key={index} className="mx-8 whitespace-nowrap font-bold text-lg">
                {event.summary}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllDayEventsBanner;
