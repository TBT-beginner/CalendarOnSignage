import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCheckboxState, setCheckboxState, SPREADSHEET_ID } from '../services/storageService';
import { CheckboxState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const MEMBERS = ['田中', '萩谷', '越川', '佐藤', '野中', '菅澤'];
const INITIAL_STATE: CheckboxState = MEMBERS.reduce((acc, name) => ({ ...acc, [name]: false }), {});
const POLLING_INTERVAL = 5000; // 5 seconds
const HIGHLIGHT_DURATION = 1500; // 1.5 seconds

interface CheckboxFrameProps {
  accessToken: string;
}

const CheckboxFrame: React.FC<CheckboxFrameProps> = ({ accessToken }) => {
  const { theme } = useTheme();
  const [state, setState] = useState<CheckboxState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedFromRemote, setUpdatedFromRemote] = useState<Set<string>>(new Set());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  const fetchData = useCallback(async () => {
    if (isSaving || !accessToken) return;

    try {
      setError(null);
      const storedState = await getCheckboxState(accessToken);
      const validatedState = MEMBERS.reduce((acc, member) => ({
        ...acc,
        [member]: storedState?.[member] ?? false
      }), {});

      const currentState = stateRef.current;
      const changedMembers = new Set<string>();
      MEMBERS.forEach(member => {
        if (currentState[member] !== validatedState[member]) {
          changedMembers.add(member);
        }
      });

      if (changedMembers.size > 0) {
        setUpdatedFromRemote(prev => new Set([...prev, ...changedMembers]));
        setTimeout(() => {
          setUpdatedFromRemote(prev => {
            const newSet = new Set(prev);
            changedMembers.forEach(member => newSet.delete(member));
            return newSet;
          });
        }, HIGHLIGHT_DURATION);
      }

      setState(validatedState);
    } catch (e) {
      console.error("Error fetching checkbox state:", e);
      if (e instanceof Error) {
        setError(`取得エラー: ${e.message}`);
      } else {
        setError('スプレッドシートから状態を取得できませんでした。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSaving, accessToken]);

  useEffect(() => {
    fetchData(); // Fetch on initial load
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleChange = async (name: string) => {
    if (!accessToken) return;

    setIsSaving(true);
    setError(null);
    const optimisticState = { ...state, [name]: !state[name] };
    setState(optimisticState);

    try {
      const remoteState = await getCheckboxState(accessToken) || INITIAL_STATE;
      const finalState = { ...remoteState, [name]: optimisticState[name] };
      await setCheckboxState(finalState, accessToken);
      setState(finalState);
    } catch (e) {
      console.error("Failed to save checkbox state:", e);
      if (e instanceof Error) {
        setError(`保存エラー: ${e.message}`);
      } else {
        setError('状態の保存に失敗しました。');
      }
      // On error, revert to the last known good state from the server.
      const currentState = await getCheckboxState(accessToken) || INITIAL_STATE;
      setState(currentState);
    } finally {
      setIsSaving(false);
    }
  };

  const renderError = () => {
    if (!error) return null;

    let title = 'スプレッドシートエラー';
    let message = '状態の読み書き中にエラーが発生しました。';
    const details = error;
    let solution: React.ReactNode = null;
    
    const errorTitleColor = theme.name === 'Light' ? 'text-red-700' : 'text-red-300';
    const errorMessageColor = theme.name === 'Light' ? 'text-red-600' : 'text-red-400';
    const solutionBgColor = theme.name === 'Light' ? 'bg-red-50' : 'bg-red-900/30';
    const solutionTextColor = theme.name === 'Light' ? 'text-red-900' : 'text-red-200';
    const solutionLinkColor = theme.name === 'Light' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300';
    const detailsBgColor = theme.name === 'Light' ? 'bg-gray-100' : 'bg-black/20';
    const detailsTextColor = theme.name === 'Light' ? 'text-gray-700' : 'text-gray-300';

    if (error.includes('API has not been used') || error.includes('sheets.googleapis.com/overview')) {
        title = 'APIが無効です';
        message = 'Google Sheets APIがプロジェクトで有効になっていません。';
        
        const urlMatch = error.match(/https?:\/\/console\.developers\.google\.com\/apis\/api\/sheets\.googleapis\.com\/overview\?project=\d+/);
        const enableApiUrl = urlMatch ? urlMatch[0] : 'https://console.cloud.google.com/apis/library/sheets.googleapis.com';

        solution = (
            <div className={`mt-2 text-left text-xs p-2 rounded-lg ${solutionBgColor} ${solutionTextColor}`}>
                <p className="font-bold">対処法:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>
                        <a href={enableApiUrl} target="_blank" rel="noopener noreferrer" className={`underline font-semibold ${solutionLinkColor}`}>
                            こちらのリンクを開いて
                        </a>
                        、Google Sheets APIを有効にしてください。
                    </li>
                    <li>APIを有効にした後、数分待ってからページを再読み込みしてください。</li>
                </ol>
                <p className="mt-2"><strong>注:</strong> この操作は、このアプリケーションが使用しているGoogle Cloudプロジェクトのオーナーまたは編集者の権限を持つアカウントで行う必要があります。</p>
            </div>
        );
    } else if (error.includes('[403]')) {
      title = '権限がありません';
      message = 'スプレッドシートへのアクセスが拒否されました。';
      solution = (
        <div className={`mt-2 text-left text-xs p-2 rounded-lg ${solutionBgColor} ${solutionTextColor}`}>
          <p className="font-bold">考えられる原因と対処法:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>現在サインインしているGoogleアカウントが、対象スプレッドシートの<strong>編集者</strong>であることを確認してください。</li>
            <li>
              <a href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`} target="_blank" rel="noopener noreferrer" className={`underline font-semibold ${solutionLinkColor}`}>
                こちらのスプレッドシートを開いて
              </a>
              、右上の「共有」ボタンから権限を確認・追加できます。
            </li>
          </ol>
        </div>
      );
    } else if (error.includes('[404]')) {
      title = '見つかりません';
      message = 'スプレッドシートまたはシートの範囲が見つかりませんでした。';
      solution = (
          <div className={`mt-2 text-left text-xs p-2 rounded-lg ${solutionBgColor} ${solutionTextColor}`}>
              <p className="font-bold">開発者向け情報:</p>
              <p className="mt-1">
                  <code>services/storageService.ts</code> ファイル内の 
                  <code>SPREADSHEET_ID</code> と <code>SHEET_RANGE</code> の値が正しいか確認してください。
              </p>
          </div>
      );
    } else if (error.includes('[401]')) {
       title = '認証エラー';
       message = '認証の有効期限が切れている可能性があります。';
       solution = <p className="text-left text-xs mt-2">ページを再読み込みして、再度サインインしてください。</p>;
    }

    return (
      <div className={`font-semibold text-sm px-4 text-center ${errorMessageColor}`}>
        <p className={`font-bold text-base ${errorTitleColor}`}>{title}</p>
        <p className="text-xs mt-1">{message}</p>
        {solution}
        <p className={`text-xs mt-2 p-1 rounded break-all font-mono ${detailsBgColor} ${detailsTextColor}`}>{details}</p>
      </div>
    );
  };


  return (
    <div
      className="transition-all overflow-hidden rounded-2xl shadow-2xl"
      style={{
        backgroundColor: theme.name === 'Light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className={`w-full h-full flex items-center justify-center p-4 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {error ? (
          renderError()
        ) : (
          <div className="flex items-center justify-around w-full gap-x-4">
            {MEMBERS.map((name) => {
                const isUpdated = updatedFromRemote.has(name);
                const ringColorClass = theme.accentText.replace('text-', 'ring-');
                const checkboxClasses = `h-5 w-5 border-2 rounded-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 ${theme.border} ${theme.accentBg} focus:ring-current ${isUpdated ? `ring-2 ${ringColorClass}` : ''}`;

                return (
                  <label key={name} className="flex items-center cursor-pointer space-x-2">
                    <input
                      type="checkbox"
                      checked={state[name] || false}
                      onChange={() => handleChange(name)}
                      className={checkboxClasses}
                      disabled={isSaving}
                    />
                    <span className={`font-bold text-lg ${theme.textPrimary}`}>
                      {name}
                    </span>
                  </label>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFrame;