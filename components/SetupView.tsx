import React from 'react';
import CalendarIcon from './icons/CalendarIcon';
import { useTheme } from '../contexts/ThemeContext';

interface SetupViewProps {
  onSignIn: () => void;
  isLoading: boolean;
  isGsiReady: boolean;
  error: string | null;
}

const GoogleIcon = () => (
  <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.522-3.447-11.018-8.125l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,36.631,44,30.886,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const SetupView: React.FC<SetupViewProps> = ({ onSignIn, isGsiReady, error }) => {
  const theme = useTheme();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGsiReady) {
      onSignIn();
    }
  };
  
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
          Googleアカウントでサインインして、カレンダーへのアクセスを許可してください。
        </p>

        <form onSubmit={handleSignIn} className="w-full">
          <button
            type="submit"
            disabled={!isGsiReady}
            className={`w-full font-bold py-4 px-6 rounded-lg text-lg sm:text-xl transition-all transform hover:scale-105 flex items-center justify-center ${theme.button} ${theme.buttonHover} ${theme.buttonText} disabled:opacity-75 disabled:cursor-not-allowed disabled:scale-100`}
          >
            <GoogleIcon />
            {isGsiReady ? 'Googleでサインイン' : '準備中...'}
          </button>
        </form>
        
        {error && (
          <div className="mt-6 text-red-700 bg-red-100 p-4 rounded-lg text-sm text-left">
            <strong>エラー:</strong> {error}
            {error.includes('g.co/dev/ eerst') && 
              <p className="mt-2 text-xs">
                <strong>開発者の方へ: </strong>このエラーは、Google CloudのクライアントIDが正しく設定されていない場合に発生します。
                <code>hooks/useGoogleAuth.ts</code> ファイル内の <code>GOOGLE_CLIENT_ID</code> を有効な値に置き換えてください。
              </p>
            }
             {(error.toLowerCase().includes('origin') || error.toLowerCase().includes('redirect_uri')) &&
              <p className="mt-2 text-xs">
                <strong>開発者の方へ: </strong>このエラーは、アプリケーションの実行元URLがGoogle Cloudコンソールで承認されていない場合に発生することが多いです。
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-800">Google Cloud Console</a>
                にアクセスし、お使いのOAuth 2.0クライアントIDの「承認済みのJavaScript生成元」に、現在のURL (<code>{window.location.origin}</code>) を追加してください。変更が反映されるまで数分かかることがあります。
              </p>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupView;