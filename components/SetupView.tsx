import React from 'react';
import CalendarIcon from './icons/CalendarIcon';
import { useTheme } from '../contexts/ThemeContext';

interface SetupViewProps {
  onSetupComplete: () => void;
  isLoading: boolean;
  error: string | null;
}

const SetupView: React.FC<SetupViewProps> = ({ onSetupComplete, isLoading, error }) => {
  const theme = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSetupComplete();
    }
  };
  
  // A bit of logic to make the icon colors match the theme better
  const iconBgClass = theme.name === 'Default' ? 'bg-orange-100' : theme.accentBg;
  const iconTextClass = theme.name === 'Default' ? 'text-orange-500' : theme.buttonText;
  const iconBorderClass = theme.name === 'Default' ? 'border-orange-200' : 'border-transparent';
  const opacityClass = theme.name === 'Default' ? '' : 'bg-opacity-20';


  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${theme.textPrimary}`}>
      <div className={`w-full max-w-lg text-center ${theme.cardBg} rounded-2xl shadow-2xl p-8 sm:p-12 transition-all`}>
        <div className={`mx-auto rounded-full p-6 w-28 h-28 flex items-center justify-center mb-8 border-4 ${iconBgClass} ${iconBorderClass} ${opacityClass}`}>
          <CalendarIcon className={`w-16 h-16 ${iconTextClass}`} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Digital Calendar Signage</h1>
        <p className={`text-base sm:text-lg mb-8 ${theme.textSecondary}`}>
          見やすい、大きな文字で今日の予定を表示します。
        </p>
        <p className={`text-sm mb-8 ${theme.textMuted}`}>
          Googleカレンダーの予定を読み込みます。下のボタンを押して開始してください。
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-4 px-6 rounded-lg text-lg sm:text-xl transition-all transform hover:scale-105 ${theme.button} ${theme.buttonHover} ${theme.buttonText} disabled:opacity-75 disabled:cursor-not-allowed disabled:scale-100`}
          >
            {isLoading ? '読み込み中...' : 'カレンダーを表示'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 text-red-700 bg-red-100 p-4 rounded-lg text-sm">
            <strong>エラー:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupView;
