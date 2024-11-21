import React from 'react';
import { NewsItem } from '../types';
import { ExternalLink } from 'lucide-react';

interface Props {
  news: NewsItem[];
  loading: boolean;
}

export default function NewsFeed({ news, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Latest News</h2>
        <p className="text-gray-700">Loading news...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Latest News</h2>
      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-200 last:border-0 pb-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink size={20} />
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(item.pubDate).toLocaleString()}
            </p>
            <p className="text-gray-700 mt-2">{item.content}</p>
          </div>
        ))}
        {news.length === 0 && (
          <p className="text-gray-700">No news available.</p>
        )}
      </div>
    </div>
  );
}