
import React from 'react';
import InformationIcon from './icons/InformationIcon';

interface SetupViewProps {
  onSignIn: () => void;
  isGsiReady: boolean;
  error: string | null;
  isLoading: boolean;
}

const SetupView: React.FC<SetupViewProps> = ({ onSignIn, isGsiReady, error, isLoading }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">今日の予定を、一目で。</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Googleカレンダーと連携して、一日のスケジュールをタイムラインで可視化します。
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg flex items-center space-x-3">
             <InformationIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={onSignIn}
            disabled={!isGsiReady || isLoading}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
                <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.2 512 244 512 111.4 512 0 400.6 0 264.1 0 127.6 111.4 16.1 244 16.1c73.1 0 134.3 28.7 181.8 72.9l-66.2 63.8C337.3 114.3 294.6 94.4 244 94.4c-84.3 0-151.4 68.1-151.4 169.7s67.1 169.7 151.4 169.7c98.2 0 128.8-67.1 133.6-102.7H244v-75.1h243.9c1.3 12.8 1.9 26.6 1.9 40.8z"></path>
                </svg>
            )}
            {isLoading ? '読み込み中...' : 'Googleアカウントでサインイン'}
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>
            このアプリはGoogleカレンダーの閲覧権限のみを要求します。あなたのデータが外部に保存されることはありません。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
