import { useQuery } from 'react-query';
import { CorrelationPair, NewsItem } from '../types';
import { getFromCache, saveToCache } from '../utils/cache';

interface UseCorrelationDataProps {
  news: NewsItem[];
  apiKey: string;
  model: string;
  refreshInterval: number;
  onCostUpdate: (cost: number) => void;
}

export function useCorrelationData({
  news,
  apiKey,
  model,
  refreshInterval,
  onCostUpdate,
}: UseCorrelationDataProps) {
  return useQuery<CorrelationPair[], Error>(
    ['correlations', news],
    async () => {
      if (!news?.length || !apiKey) return [];

      const cached = getFromCache();
      if (cached?.correlations) {
        return cached.correlations;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst expert in correlations between different assets.',
            },
            {
              role: 'user',
              content: `Analyze these news items and identify correlations between major currency pairs, commodities, and stock indices. Return the data as JSON array with correlation scores (-1 to 1) and sentiment impact (-1 to 1):\n${JSON.stringify(news)}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze correlations. Please check your API key.');
      }

      const data = await response.json();
      const correlations = JSON.parse(data.choices[0].message.content);
      
      saveToCache({ correlations, news });
      onCostUpdate(data.usage.total_tokens * 0.00001);
      
      return correlations;
    },
    {
      enabled: !!news?.length && !!apiKey,
      refetchInterval,
      staleTime: 5 * 60 * 1000,
      retry: false,
      initialData: [],
    }
  );
}