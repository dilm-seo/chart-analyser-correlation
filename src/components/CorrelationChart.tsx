import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CorrelationPair } from '../types';

interface Props {
  data: CorrelationPair[];
  loading: boolean;
  hasApiKey: boolean;
  onSettingsClick: () => void;
}

export default function CorrelationChart({ data, loading, hasApiKey, onSettingsClick }: Props) {
  if (!hasApiKey) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-gray-700 mb-4">Please configure your OpenAI API key in settings to start analyzing correlations.</p>
        <button
          onClick={onSettingsClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Open Settings
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-gray-700">Loading correlation data...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-gray-700">No correlation data available.</p>
      </div>
    );
  }

  const chartData = data.map((pair) => ({
    name: `${pair.asset1}/${pair.asset2}`,
    correlation: pair.correlation,
    sentiment: pair.sentiment,
  }));

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow-lg">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[-1, 1]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="correlation" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Correlation"
          />
          <Line 
            type="monotone" 
            dataKey="sentiment" 
            stroke="#16a34a" 
            strokeWidth={2}
            name="Sentiment Impact"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}