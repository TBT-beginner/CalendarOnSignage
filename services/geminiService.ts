import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from '../types';

// APIキーは環境変数から自動的に供給されると仮定
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 日本語の曜日を取得するヘルパー
const getJapaneseWeekday = (date: Date): string => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[date.getDay()];
}

export const generateSampleCalendarEvents = async (): Promise<CalendarEvent[]> => {
  // 今日から1週間の日付を生成
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const weekday = getJapaneseWeekday(d);
    return `${year}-${month}-${day} (${weekday})`;
  });

  const prompt = `あなたは優秀なアシスタントです。日本の一般的なIT企業の開発チームの、今日から1週間のリアルなサンプルカレンダーイベントを15件、JSON形式で生成してください。

以下の日付と曜日を参考に、イベントを割り振ってください。
- ${dates.join('\n- ')}

生成するイベントには、以下の要素を含めてください。
- チームの定例会議（例：「デイリースクラム」「週次定例」）
- 1on1ミーティング
- 集中開発作業の時間（例：「フォーカスタイム」）
- 少し長めの会議（例：「新機能ブレスト」「四半期レビュー」）
- 終日イベント（例：「全社研修」「夏季休暇」）
- 個人の予定（例：「歯科検診」「ランチ」）

内容は自然で、現実的な時間配分になるようにお願いします。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // テキストとJSON生成に適したモデル
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: '予定のタイトル (日本語)',
              },
              startTime: {
                type: Type.STRING,
                description: '開始時刻 (HH:MM形式)。終日イベントの場合は "00:00"。',
              },
              endTime: {
                type: Type.STRING,
                description: '終了時刻 (HH:MM形式)。終日イベントの場合は "24:00"。',
              },
              isAllDay: {
                type: Type.BOOLEAN,
                description: '終日イベントかどうか。',
              },
              date: {
                type: Type.STRING,
                description: `予定の日付 (YYYY-MM-DD形式)。利用可能な日付: ${dates.map(d => d.split(' ')[0]).join(', ')}`,
              },
            },
            required: ['summary', 'startTime', 'endTime', 'isAllDay', 'date'],
          },
        },
      },
    });
    
    // response.textはJSON文字列なのでパースする
    const jsonStr = response.text.trim();
    const generatedEvents: CalendarEvent[] = JSON.parse(jsonStr);
    
    // 念のため日付と時間でソート
    return generatedEvents.sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        const aDateTime = `${a.date}T${a.startTime}`;
        const bDateTime = `${b.date}T${b.startTime}`;
        return aDateTime.localeCompare(bDateTime);
    });

  } catch (error) {
    console.error("Gemini APIからのサンプルデータ生成に失敗しました:", error);
    // フォールバック用の静的データを提供
    const todayStr = dates[0].split(' ')[0];
    return [
      { summary: 'デイリースクラム', startTime: '10:00', endTime: '10:15', isAllDay: false, date: todayStr },
      { summary: 'サンプルプロジェクト会議', startTime: '10:30', endTime: '12:00', isAllDay: false, date: todayStr },
      { summary: '【フォーカス】機能開発', startTime: '13:00', endTime: '15:00', isAllDay: false, date: todayStr },
      { summary: 'チーム週次定例', startTime: '10:00', endTime: '11:00', isAllDay: false, date: dates[1].split(' ')[0] },
      { summary: '全社研修', startTime: '00:00', endTime: '24:00', isAllDay: true, date: dates[2].split(' ')[0] },
    ];
  }
};