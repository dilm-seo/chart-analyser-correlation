import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CorrelationPair } from '../types';

interface Props {
  data: CorrelationPair[];
}

export default function CorrelationChart({ data }: Props) {
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
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="correlation" 
            stroke="#2563eb" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="sentiment" 
            stroke="#16a34a" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}