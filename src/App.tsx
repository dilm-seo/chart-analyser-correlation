import React from 'react';
import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import CorrelationChart from './components/CorrelationChart';
import NewsFeed from './components/NewsFeed';
import CostEstimate from './components/CostEstimate';
import ErrorDisplay from './components/ErrorDisplay';
import { Settings } from './types';
import { useNewsData } from './hooks/useNewsData';
import { useCorrelationData } from './hooks/useCorrelationData';

const DEFAULT_SETTINGS: Settings = {
  openaiKey: '',
  model: 'gpt-4-turbo-preview',
  refreshInterval: 900000,
  showCostEstimates: true,
};

function App() {
  const [settings, setSettings] = React.useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(!settings.openaiKey);
  const [estimatedCost, setEstimatedCost] = React.useState(0);

  const { 
    data: news, 
    isLoading: newsLoading, 
    error: newsError,
    refetch: refetchNews 
  } = useNewsData(settings.refreshInterval);

  const {
    data: correlations,
    isLoading: correlationsLoading,
    error: correlationsError
  } = useCorrelationData({
    news: news || [],
    apiKey: settings.openaiKey,
    model: settings.model,
    refreshInterval: settings.refreshInterval,
    onCostUpdate: (cost) => setEstimatedCost((prev) => prev + cost),
  });

  React.useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  if (newsError || correlationsError) {
    return <ErrorDisplay error={newsError || correlationsError} />;
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
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={newsLoading || correlationsLoading || !settings.openaiKey}
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
            <CorrelationChart
              data={correlations || []}
              loading={correlationsLoading}
              hasApiKey={!!settings.openaiKey}
              onSettingsClick={() => setIsSettingsOpen(true)}
            />
          </div>
          <div className="lg:col-span-1">
            <NewsFeed
              news={news || []}
              loading={newsLoading}
            />
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