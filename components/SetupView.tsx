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

const ExclamationIcon = () => (
  <svg className="h-6 w-6 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);


const SetupView: React.FC<SetupViewProps> = ({ onSignIn, isGsiReady, error }) => {
  const { theme } = useTheme();

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
  
  const lowerError = error?.toLowerCase() ?? '';
  const isOriginError = ['origin', 'redirect_uri', 'redirect_uri_mismatch', 'invalid_request', 'storagerelay'].some(key => lowerError.includes(key));
  const isClientIdError = lowerError.includes('g.co/dev/eerst');

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
          <div className="mt-8 text-left text-sm">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg" role="alert">
              <div className="flex">
                <div className="py-1"><ExclamationIcon /></div>
                <div className="ml-3 flex-1">
                  <p className="font-bold text-red-900">Google認証エラー</p>
                  <p className="text-red-900">サインインできませんでした。根本的な原因はGoogle Cloud側の設定にある可能性が高いです。</p>
                  <p className="mt-2 font-mono text-xs bg-red-200 text-red-900 p-2 rounded break-words">{error}</p>
                </div>
              </div>
            </div>
            
            {(isOriginError || isClientIdError) && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                <h4 className="font-bold text-gray-900 text-base">このエラーを解決するには</h4>
                <div className="mt-2">
                  <strong className="block p-2 bg-blue-100 text-blue-900 rounded border border-blue-200">もしあなたが開発者でない場合は、この画面全体のスクリーンショットを撮り、アプリケーションの管理者または開発担当者にお送りください。</strong>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <strong className="block text-base text-gray-800">開発者向け情報：</strong>
                  
                  {isOriginError && (
                    <div className="mt-2">
                      <p className="font-semibold text-gray-700">原因: 承認されていないURL (JavaScript生成元)</p>
                      <p className="mt-1 text-gray-600">Googleのセキュリティポリシーにより、事前に登録されたURLからのみ認証リクエストが許可されます。現在のURLが登録されていないようです。</p>
                      <ol className="list-decimal list-inside my-3 space-y-2 text-gray-700">
                        <li>
                          <strong>以下のURLをコピーしてください:</strong>
                          <div className="flex items-center mt-1">
                            <code className="bg-gray-200 text-gray-900 p-2 rounded-l font-mono text-xs break-all flex-grow">{window.location.origin}</code>
                            <button 
                              onClick={(e) => {
                                  e.preventDefault();
                                  navigator.clipboard.writeText(window.location.origin);
                                  const originalText = 'コピー';
                                  const button = e.currentTarget;
                                  button.textContent = 'コピー完了!';
                                  setTimeout(() => { button.textContent = originalText; }, 2000);
                              }}
                              className="bg-gray-600 text-white font-bold py-2 px-3 rounded-r hover:bg-gray-700 transition-colors text-xs w-20 text-center"
                            >
                              コピー
                            </button>
                          </div>
                        </li>
                        <li>
                          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">
                            Google Cloud認証情報ページ
                          </a>
                          を開きます。
                        </li>
                        <li>プロジェクトの「OAuth 2.0 クライアント ID」を選択します。</li>
                        <li>「承認済みのJavaScript生成元」セクションで「+ URI を追加」をクリックし、コピーしたURLを貼り付けて保存します。</li>
                      </ol>
                      <p className="text-xs text-gray-500"><strong>注意:</strong> 設定の反映には数分かかることがあります。反映後にページを再読み込みしてください。</p>
                    </div>
                  )}

                  {isClientIdError && (
                       <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="font-semibold text-gray-700">原因：クライアントIDが無効</p>
                          <p className="mt-1 text-gray-600">クライアントIDが無効か、削除されているようです。<code>hooks/useGoogleAuth.ts</code> ファイル内の <code>GOOGLE_CLIENT_ID</code> が、Google Cloud Consoleで作成したものと一致しているか確認してください。</p>
                      </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupView;