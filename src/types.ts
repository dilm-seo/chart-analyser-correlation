export interface Settings {
  openaiKey: string;
  model: string;
  refreshInterval: number;
  showCostEstimates: boolean;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
}

export interface CorrelationPair {
  asset1: string;
  asset2: string;
  correlation: number;
  sentiment: number;
  newsImpact: NewsItem[];
}