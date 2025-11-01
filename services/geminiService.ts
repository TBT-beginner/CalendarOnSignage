import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "今日の架空の会議やタスクの予定を20個生成してください。それぞれに概要（summary）、開始時刻（startTime）、終了時刻（endTime）をHH:mm形式で含めてください。JSON配列で返してください。",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "タスクや会議の概要。",
              },
              startTime: {
                type: Type.STRING,
                description: "開始時刻 (HH:mm 形式)。",
              },
              endTime: {
                type: Type.STRING,
                description: "終了時刻 (HH:mm 形式)。",
              },
            },
            required: ["summary", "startTime", "endTime"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const events: CalendarEvent[] = JSON.parse(jsonString);
    
    // Sort events by start time
    return events.sort((a, b) => a.startTime.localeCompare(b.startTime));

  } catch (error) {
    console.error("カレンダーイベントの生成中にエラーが発生しました:", error);
    // Return some fallback data in case of an error
    return [
      { summary: '朝活: メールの確認と一日の計画', startTime: '08:00', endTime: '08:30' },
      { summary: 'チームA: 朝会', startTime: '08:30', endTime: '08:45' },
      { summary: '集中作業: コア機能開発', startTime: '09:00', endTime: '10:00' },
      { summary: '製品ロードマップ会議', startTime: '10:00', endTime: '11:00' },
      { summary: '新人とのコーヒーチャット', startTime: '11:00', endTime: '11:15' },
      { summary: 'デザインレビュー: 新UIコンポーネント', startTime: '11:15', endTime: '12:00' },
      { summary: '昼休み', startTime: '12:00', endTime: '13:00' },
      { summary: 'クライアント定例: プロジェクトPhoenix', startTime: '13:00', endTime: '13:45' },
      { summary: 'ブレインストーミング: 第4四半期施策', startTime: '14:00', endTime: '15:00' },
      { summary: 'コードリファクタリング', startTime: '15:00', endTime: '15:45' },
      { summary: 'マーケティングチームと同期', startTime: '15:45', endTime: '16:00' },
      { summary: 'チームB: 週次定例', startTime: '16:00', endTime: '16:30' },
      { summary: 'プロトタイプのUXフィードバック会', startTime: '16:30', endTime: '17:00' },
      { summary: '全社ミーティング', startTime: '17:00', endTime: '17:30' },
      { summary: '日報提出', startTime: '17:30', endTime: '17:45' },
      { summary: '明日の会議準備', startTime: '17:45', endTime: '18:00' },
      { summary: 'セキュリティ監査レビュー', startTime: '18:00', endTime: '18:30' },
      { summary: 'パフォーマンスチューニング分析', startTime: '18:30', endTime: '19:00' },
      { summary: 'ドキュメント更新', startTime: '19:00', endTime: '19:30' },
      { summary: 'プレゼン資料最終化', startTime: '19:30', endTime: '20:00' },
    ].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
};