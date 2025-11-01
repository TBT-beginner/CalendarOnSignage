import React, { useState } from 'react';
import CalendarIcon from './icons/CalendarIcon';
import { useTheme } from '../contexts/ThemeContext';

interface SetupViewProps {
  onSetupComplete: (calendarId: string) => void;
  isLoading: boolean;
}

const SetupView: React.FC<SetupViewProps> = ({ onSetupComplete, isLoading }) => {
  const theme = useTheme();
  const [calendarId, setCalendarId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete(calendarId || 'gemini-generated-events');
  };
  
  // A bit of logic to make the icon colors match the theme better
  const iconBgClass = theme.name === 'Default' ? 'bg-orange-100' : theme.accentBg;
  const iconTextClass = theme.name === 'Default' ? 'text-orange-500' : theme.buttonText;
  const iconBorderClass = theme.name === 'Default' ? 'border-orange-200' : 'border-transparent';
  const opacityClass = theme.name === 'Default' ? '' : 'bg-opacity-20';


  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${theme.textPrimary}`}>
      <div className={`w-full max-w-lg text-center ${theme.cardBg} rounded-2xl shadow-2xl p-8 sm:p-12`}>
        <div className={`mx-auto rounded-full p-6 w-28 h-28 flex items-center justify-center mb-8 border-4 ${iconBgClass} ${iconBorderClass} ${opacityClass}`}>
          <CalendarIcon className={`w-16 h-16 ${iconTextClass}`} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Digital Calendar Signage</h1>
        <p className={`text-base sm:text-lg mb-8 ${theme.textSecondary}`}>
          見やすい、大きな文字で今日の予定を表示します。
        </p>
        <p className={`text-sm mb-8 ${theme.textMuted}`}>
          デモのため、Geminiが今日のタスクを自動生成します。下のボタンを押して開始してください。
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-4 px-6 rounded-lg text-lg sm:text-xl transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${theme.button} ${theme.buttonHover} ${theme.buttonText}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </div>
            ) : (
              'カレンダーを表示'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupView;