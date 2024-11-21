import React from 'react';
import { useQuery } from 'react-query';
import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import CorrelationChart from './components/CorrelationChart';
import NewsFeed from './components/NewsFeed';
import CostEstimate from './components/CostEstimate';
import { Settings, NewsItem, CorrelationPair } from './types';
import { parseString } from 'xml2js';

const DEFAULT_SETTINGS: Settings = {
  openaiKey: '',
  model: 'gpt-4-turbo-preview',
  refreshInterval: 900000, // 15 minutes
  showCostEstimates: true,
};

function App() {
  const [settings, setSettings] = React.useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(!settings.openaiKey);
  const [estimatedCost, setEstimatedCost] = React.useState(0);

  const { data: news, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useQuery<NewsItem[]>(
    'news',
    async () => {
      const response = await fetch('https://www.forexlive.com/feed/news');
      const text = await response.text();
      
      return new Promise((resolve, reject) => {
        parseString(text, (err, result) => {
          if (err) reject(err);
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
      refetchInterval: settings.refreshInterval,
    }
  );

  const { data: correlations, isLoading: correlationsLoading } = useQuery<CorrelationPair[]>(
    ['correlations', news],
    async () => {
      if (!news || !settings.openaiKey) return [];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openaiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
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

      const data = await response.json();
      setEstimatedCost((prev) => prev + (data.usage.total_tokens * 0.00001));
      
      return JSON.parse(data.choices[0].message.content);
    },
    {
      enabled: !!news && !!settings.openaiKey,
      refetchInterval: settings.refreshInterval,
    }
  );

  React.useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  if (newsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading News</h1>
          <p className="text-gray-700">{(newsError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Forex Correlation Analyzer</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => refetchNews()}
                className="p-2 text-gray-500 hover:text-gray-700"
                disabled={newsLoading || correlationsLoading}
              >
                <RefreshCw className={`${(newsLoading || correlationsLoading) ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <SettingsIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {correlations && correlations.length > 0 ? (
              <CorrelationChart data={correlations} />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <p className="text-gray-700">
                  {!settings.openaiKey 
                    ? 'Please configure your OpenAI API key in settings'
                    : 'Loading correlation data...'}
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            {news ? (
              <NewsFeed news={news} />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <p className="text-gray-700">Loading news feed...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      <CostEstimate
        requestCost={estimatedCost}
        visible={settings.showCostEstimates}
      />
    </div>
  );
}

export default App;