import { CheckboxState } from '../types';

// スプレッドシートの情報
const SPREADSHEET_ID = '12FsH16GpVQ7sWzlMPnoDS__FS1aIg2lk-3P4ppwTeI8';
const SHEET_RANGE = 'A2:F2'; // データを読み書きする範囲 (2行目のA列からF列)

// ヘッダーのメンバー順 (スプレッドシートの列順と一致させる必要があります)
const MEMBERS = ['田中', '萩谷', '越川', '佐藤', '野中', '菅澤'];

// Google Sheets APIのエンドポイントURL
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}`;

/**
 * スプレッドシートのデータ形式 (["checked", "none", ...]) を
 * アプリケーションの状態オブジェクト ({ 田中: true, 萩谷: false, ... }) へ変換します。
 * @param values スプレッドシートから取得した値の配列
 * @returns CheckboxStateオブジェクト
 */
const transformToState = (values: string[]): CheckboxState => {
  const state: CheckboxState = {};
  MEMBERS.forEach((member, index) => {
    state[member] = values[index] === 'checked';
  });
  return state;
};

/**
 * アプリケーションの状態オブジェクトをスプレッドシートのデータ形式へ変換します。
 * @param state CheckboxStateオブジェクト
 * @returns スプレッドシートに書き込む値の配列
 */
const transformToValues = (state: CheckboxState): string[] => {
  return MEMBERS.map(member => (state[member] ? 'checked' : 'none'));
};

/**
 * Googleスプレッドシートからチェックボックスの状態を取得します。
 * @param accessToken 認証用のOAuth 2.0アクセストークン
 * @returns CheckboxStateオブジェクト、またはデータが存在しない場合は初期化されたオブジェクト
 */
export const getCheckboxState = async (accessToken: string): Promise<CheckboxState | null> => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch from Google Sheets:', errorData);
      throw new Error(`Google Sheets API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (data.values && data.values[0]) {
      return transformToState(data.values[0]);
    }
    // データがない場合は、全員 'false' の初期状態を返す
    return MEMBERS.reduce((acc, name) => ({ ...acc, [name]: false }), {});
  } catch (error) {
    console.error('Error in getCheckboxState:', error);
    throw error; // エラーを呼び出し元に伝播させる
  }
};

/**
 * チェックボックスの状態をGoogleスプレッドシートに保存します。
 * @param state 保存するCheckboxStateオブジェクト
 * @param accessToken 認証用のOAuth 2.0アクセストークン
 */
export const setCheckboxState = async (state: CheckboxState, accessToken: string): Promise<void> => {
  try {
    const values = [transformToValues(state)];
    const body = JSON.stringify({ values });

    const response = await fetch(`${API_URL}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update Google Sheets:', errorData);
      throw new Error(`Google Sheets API Error: ${errorData.error?.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error in setCheckboxState:', error);
    throw error; // エラーを呼び出し元に伝播させる
  }
};