import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  error: Error;
}

export default function ErrorDisplay({ error }: Props) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
        </div>
        <p className="text-gray-700">{error.message}</p>
      </div>
    </div>
  );
}