import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  requestCost: number;
  visible: boolean;
}

export default function CostEstimate({ requestCost, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
      <AlertCircle className="text-yellow-500" />
      <div>
        <p className="text-sm font-medium text-gray-900">Estimated Cost</p>
        <p className="text-lg font-bold text-blue-600">${requestCost.toFixed(4)}</p>
      </div>
    </div>
  );
}