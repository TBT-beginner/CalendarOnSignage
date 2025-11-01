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
  
  const accentColorValue = theme.accentText.replace('text-', '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div
        className={`${theme.cardBg} ${theme.cardBorder} w-full max-w-md rounded-3xl p-6 m-4 flex flex-col`}
        style={{ boxShadow: theme.clayShadow }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-4 ${theme.textPrimary} ${theme.fontDisplay}`}>
          表示するカレンダーを選択
        </h2>
        <div className="flex-grow overflow-y-auto max-h-[60vh] custom-scrollbar pr-2 -mr-2">
          {availableCalendars.length > 0 ? (
            <ul className="space-y-2">
              {availableCalendars.map((calendar) => (
                <li key={calendar.id}>
                  <label className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors hover:${theme.selectionBg} ${localSelectedIds.has(calendar.id) ? theme.selectionBg : ''}`}>
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
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${theme.button} ${theme.buttonText} ${theme.buttonBorder}`}
            style={{ boxShadow: theme.clayButtonShadow, transition: 'box-shadow 0.1s ease-in-out' }}
            onMouseDown={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonPressedShadow)}
            onMouseUp={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonShadow)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = theme.clayButtonShadow)}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSelectionModal;