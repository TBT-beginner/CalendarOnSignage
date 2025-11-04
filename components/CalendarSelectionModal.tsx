import React, { useState, useEffect } from 'react';
import { CalendarListEntry } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CalendarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCalendars: CalendarListEntry[];
  selectedIds: string[];
  onSave: (selectedIds: string[]) => void;
  showEndTime: boolean;
  onToggleShowEndTime: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
  const { theme } = useTheme();
  return (
    <button
      type="button"
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${checked ? theme.accentBg : 'bg-gray-300 dark:bg-gray-600'}`}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      ></span>
    </button>
  );
};


const CalendarSelectionModal: React.FC<CalendarSelectionModalProps> = ({
  isOpen,
  onClose,
  availableCalendars,
  selectedIds,
  onSave,
  showEndTime,
  onToggleShowEndTime
}) => {
  const { theme } = useTheme();
  const [localSelectedIds, setLocalSelectedIds] = useState(new Set(selectedIds));

  useEffect(() => {
    setLocalSelectedIds(new Set(selectedIds));
  }, [selectedIds, isOpen]);

  const handleToggle = (id: string) => {
    const newSelection = new Set(localSelectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setLocalSelectedIds(newSelection);
  };

  const handleSave = () => {
    onSave(Array.from(localSelectedIds));
  };

  if (!isOpen) {
    return null;
  }
  
  const accentColorValue = theme.accentText.replace('text-', '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div
        className={`${theme.cardBg} ${theme.cardBorder} w-full max-w-md rounded-3xl p-6 m-4 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-4 ${theme.textPrimary} ${theme.fontDisplay}`}>
          設定
        </h2>
        
        <div className={`border-y ${theme.border} py-4 my-2`}>
           <div
            className="flex items-center justify-between cursor-pointer"
            onClick={onToggleShowEndTime}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleShowEndTime(); }}
            aria-pressed={showEndTime}
          >
            <span className={`text-base ${theme.textPrimary}`}>予定の終了時刻を表示する</span>
            <div className="pointer-events-none">
              <ToggleSwitch checked={showEndTime} onChange={() => {}} />
            </div>
          </div>
        </div>

        <h3 className={`text-lg font-bold mt-4 mb-2 ${theme.textPrimary}`}>
            表示カレンダー
        </h3>

        <div className="flex-grow overflow-y-auto max-h-[50vh] custom-scrollbar pr-2 -mr-2">
          {availableCalendars.length > 0 ? (
            <ul className="space-y-2">
              {availableCalendars.map((calendar) => (
                <li key={calendar.id}>
                  <label className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${theme.hoverBg} ${localSelectedIds.has(calendar.id) ? theme.selectionBg : ''}`}>
                    <input
                      type="checkbox"
                      className={`h-5 w-5 border-2 ${theme.checkboxShape} ${theme.border} ${theme.accentBg} focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current`}
                      style={{ color: accentColorValue }}
                      checked={localSelectedIds.has(calendar.id)}
                      onChange={() => handleToggle(calendar.id)}
                    />
                    <span
                      className="w-4 h-4 rounded-full ml-4 mr-3 flex-shrink-0"
                      style={{ backgroundColor: calendar.backgroundColor }}
                    ></span>
                    <span className={`flex-grow ${theme.textPrimary}`}>
                      {calendar.summary}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className={theme.textMuted}>利用可能なカレンダーはありません。</p>
          )}
        </div>
        <div className="flex justify-end gap-4 pt-6 mt-auto">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl font-semibold transition-colors ${theme.textSecondary} hover:${theme.textPrimary}`}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${theme.button} ${theme.buttonText} ${theme.buttonHover}`}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSelectionModal;