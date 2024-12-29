import React from 'react';
import { useSwapStore } from '../stores/swapStore';

export function SwapDetails() {
  const { priceImpact, outputAmount } = useSwapStore();

  return (
    <div className="p-4 bg-[#111111] rounded-xl border border-purple-600/30">
      <div className="space-y-3">
        <div className="flex justify-between text-gray-400">
          <span>Price Impact</span>
          <span className="text-green-400">{priceImpact}%</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Route</span>
          <span className="text-purple-400">Jupiter Aggregator v6</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Minimum Received</span>
          <span className="text-green-400">{outputAmount * 0.995} $GRIN</span>
        </div>
      </div>
    </div>
  );
}