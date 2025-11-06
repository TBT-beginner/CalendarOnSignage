import { CheckboxState, MemberStatus } from '../types';

// スプレッドシートの情報
export const SPREADSHEET_ID = '12FsH16GpVQ7sWzlMPnoDS__FS1aIg2lk-3P4ppwTeI8';
// 範囲を2行に拡張: 2行目が在・不在、3行目がコメント
const SHEET_RANGE = 'A2:F3';

// ヘッダーのメンバー順 (スプレッドシートの列順と一致させる必要があります)
const MEMBERS = ['田中', '萩谷', '越川', '佐藤', '野中', '菅澤'];

// Google Sheets APIのエンドポイントURL
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}`;

/**
 * スプレッドシートのデータ形式 (2次元配列) を
 * アプリケーションの状態オブジェクト ({ 田中: { isPresent: true, comment: '' }, ... }) へ変換します。
 * @param values スプレッドシートから取得した値の2次元配列
 * @returns CheckboxStateオブジェクト
 */
const transformToState = (values: string[][]): CheckboxState => {
  const state: CheckboxState = {};
  const statusRow = values[0] || [];
  const commentRow = values[1] || [];
  
  MEMBERS.forEach((member, index) => {
    state[member] = {
      isPresent: statusRow[index] === 'PRESENT',
      comment: commentRow[index] || ''
    };
  });
  return state;
};

/**
 * アプリケーションの状態オブジェクトをスプレッドシートのデータ形式へ変換します。
 * @param state CheckboxStateオブジェクト
 * @returns スプレッドシートに書き込む値の2次元配列
 */
const transformToValues = (state: CheckboxState): string[][] => {
  const statusRow: string[] = [];
  const commentRow: string[] = [];
  MEMBERS.forEach(member => {
    statusRow.push(state[member]?.isPresent ? 'PRESENT' : 'ABSENT');
    commentRow.push(state[member]?.comment || '');
  });
  return [statusRow, commentRow];
};

/**
 * Googleスプレッドシートから状態を取得します。
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
      throw new Error(`[${response.status}] ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (data.values && data.values.length > 0) {
      return transformToState(data.values);
    }
    // データがない場合は、全員 'false' の初期状態を返す
    return MEMBERS.reduce((acc, name) => {
      acc[name] = { isPresent: false, comment: '' };
      return acc;
    }, {} as CheckboxState);
  } catch (error) {
    console.error('Error in getCheckboxState:', error);
    throw error;
  }
};

/**
 * 状態をGoogleスプレッドシートに保存します。
 * @param state 保存するCheckboxStateオブジェクト
 * @param accessToken 認証用のOAuth 2.0アクセストークン
 */
export const setCheckboxState = async (state: CheckboxState, accessToken: string): Promise<void> => {
  try {
    const values = transformToValues(state);
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
      throw new Error(`[${response.status}] ${errorData.error?.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error in setCheckboxState:', error);
    throw error;
  }
};
