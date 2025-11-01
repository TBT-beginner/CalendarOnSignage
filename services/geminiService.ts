
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CalendarEvent } from '../types';

// The API key is assumed to be set in the environment variables.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    // FIX: Initialize GoogleGenAI with a named parameter for the apiKey.
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("Gemini API key not found. Make sure process.env.API_KEY is set.");
}


/**
 * Generates a summary of the day's events using the Gemini API.
 * @param events An array of calendar events for the day.
 * @param currentTime A string representing the current time (e.g., "HH:MM").
 * @returns A promise that resolves to a string containing the AI-generated summary.
 */
export const generateEventSummary = async (
  events: CalendarEvent[],
  currentTime: string
): Promise<string> => {
  if (!ai) {
    return "Gemini APIキーが設定されていないため、要約を生成できません。";
  }
  if (events.length === 0) {
    return "今日の予定はありません。ゆっくり過ごしましょう！";
  }

  // Format the events into a string for the prompt
  const eventsString = events
    .map(
      (e) =>
        `- ${e.summary} (${e.isAllDay ? "終日" : `${e.startTime} - ${e.endTime}`})`
    )
    .join("\n");

  const prompt = `
    あなたは優秀なアシスタントです。以下のカレンダー情報と現在時刻を基に、ユーザーの一日の状況を簡潔に、親しみやすいトーンで要約してください。
    現在進行中の予定、次の予定、そして一日の全体像について触れてください。

    # カレンダー情報
    ${eventsString}

    # 現在時刻
    ${currentTime}

    # 要約の例
    - こんにちは！今日は1件のミーティングがあります。
    - 現在は「全体定例」の最中です。次は14:00からの「ブレスト」ですね。
    - 「〇〇とのランチ」まであと30分です。準備はいいですか？
    - 今日は予定が詰まっていますね！頑張ってください！

    # あなたの回答
  `;

  try {
    // FIX: Use ai.models.generateContent instead of deprecated methods.
    // FIX: Select an appropriate model for basic text tasks.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // FIX: Directly access the .text property for the response text.
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return "申し訳ありません、予定の要約中にエラーが発生しました。";
  }
};
