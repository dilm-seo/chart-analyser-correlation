import { CorrelationPair, NewsItem } from '../types';

interface CacheData {
  correlations: CorrelationPair[];
  news: NewsItem[];
  timestamp: number;
}

const CACHE_KEY = 'forex_analyzer_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function saveToCache(data: { correlations: CorrelationPair[]; news: NewsItem[] }) {
  const cacheData: CacheData = {
    ...data,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to save data to cache:', error);
  }
}

export function getFromCache(): CacheData | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const data: CacheData = JSON.parse(cached);
    if (Date.now() - (data?.timestamp || 0) > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to parse cache data:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}
