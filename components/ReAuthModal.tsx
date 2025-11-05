import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ExclamationIcon from './icons/ExclamationIcon';

interface ReAuthModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReAuthModal: React.FC<ReAuthModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const { theme } = useTheme();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${theme.cardBg} ${theme.cardBorder} w-full max-w-lg rounded-3xl p-8 m-4 flex flex-col items-center text-center`}
      >
        <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mb-6">
            <ExclamationIcon className="h-10 w-10 text-red-600" aria-hidden="true" />
        </div>
        <h2 id="modal-title" className={`text-2xl font-bold mb-4 ${theme.textPrimary} ${theme.fontDisplay}`}>
          セッションの有効期限切れ
        </h2>
        <p className={`mb-8 ${theme.textSecondary}`}>
          Googleとの認証セッションの有効期限が切れました。
          カレンダーの情報を更新し続けるには、再度サインインしてください。
        </p>
        <div className="flex justify-center gap-4 w-full">
          <button
            onClick={onCancel}
            className={`px-8 py-3 w-1/2 rounded-xl font-semibold transition-colors ${theme.textSecondary} ${theme.hoverBg}`}
          >
            サインアウト
          </button>
          <button
            onClick={onConfirm}
            className={`px-8 py-3 w-1/2 rounded-xl font-semibold transition-all ${theme.accentBg} text-white hover:opacity-90`}
          >
            再度サインイン
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReAuthModal;
