import React, { useState, useEffect } from 'react';
import { CalendarListEntry } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CalendarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCalendars: CalendarListEntry[];
  selectedIds: string[];
  onSave: (selectedIds: string[]) => void;
}

const CalendarSelectionModal: React.FC<CalendarSelectionModalProps> = ({
  isOpen,
  onClose,
  availableCalendars,
  selectedIds,
  onSave,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div
        className={`${theme.cardBg} w-full max-w-md rounded-xl shadow-2xl p-6 m-4 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-4 ${theme.textPrimary}`}>
          表示するカレンダーを選択
        </h2>
        <div className="flex-grow overflow-y-auto max-h-[60vh] custom-scrollbar pr-2 -mr-2">
          {availableCalendars.length > 0 ? (
            <ul className="space-y-2">
              {availableCalendars.map((calendar) => (
                <li key={calendar.id}>
                  <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-500/10 ${localSelectedIds.has(calendar.id) ? 'bg-gray-500/20' : ''}`}>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      style={{ accentColor: theme.accentBg.replace('bg-','').split('-')[0] }}
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
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${theme.textSecondary} hover:bg-gray-500/10`}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${theme.button} ${theme.buttonHover} ${theme.buttonText}`}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSelectionModal;
