
import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { generateEventSummary } from '../services/geminiService';

interface EventStatusSummaryProps {
  events: CalendarEvent[];
}

const EventStatusSummary: React.FC<EventStatusSummaryProps> = ({ events }) => {
  const [summary, setSummary] = useState<string>('今日の予定を分析中...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      const now = new Date();
      const currentTime = now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
      
      try {
        const generatedSummary = await generateEventSummary(events, currentTime);
        setSummary(generatedSummary);
      } catch (error) {
        console.error("Failed to generate event summary:", error);
        setSummary("要約の生成に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [events]);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        今日のまとめ
      </h3>
      {isLoading ? (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>AIが予定を読み込んでいます...</span>
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {summary}
        </p>
      )}
    </div>
  );
};

export default EventStatusSummary;
