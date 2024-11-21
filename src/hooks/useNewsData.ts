import { useQuery } from 'react-query';
import { parseString } from 'xml2js';
import { NewsItem } from '../types';
import { getFromCache } from '../utils/cache';

export function useNewsData(refreshInterval: number) {
  return useQuery<NewsItem[], Error>(
    'news',
    async () => {
      const cached = getFromCache();
      if (cached?.news) {
        return cached.news;
      }

      const response = await fetch('https://www.forexlive.com/feed/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news feed');
      }
      
      const text = await response.text();
      
      return new Promise<NewsItem[]>((resolve, reject) => {
        parseString(text, (err, result) => {
          if (err) reject(new Error('Failed to parse news feed'));
          if (!result?.rss?.channel?.[0]?.item) {
            resolve([]);
            return;
          }
          const items = result.rss.channel[0].item.map((item: any) => ({
            title: item.title[0],
            link: item.link[0],
            pubDate: item.pubDate[0],
            content: item.description[0],
          }));
          resolve(items);
        });
      });
    },
    {
      refetchInterval: refreshInterval,
      staleTime: 5 * 60 * 1000,
      initialData: [],
      retry: 2,
    }
  );
}