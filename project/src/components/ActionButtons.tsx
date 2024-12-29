import React from 'react';
import { Shield, TrendingUp } from 'lucide-react';

interface ActionButtonsProps {
  onExecute: () => void;
  loading: boolean;
  disabled: boolean;
}

export function ActionButtons({ onExecute, loading, disabled }: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onExecute}
        disabled={loading || disabled}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-green-500 rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Execute Swap'}
      </button>

      <div className="flex gap-4">
        <button className="flex-1 py-3 bg-[#111111] rounded-xl hover:bg-purple-900/20 transition-all border border-purple-600/30 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400">MEV Protection</span>
        </button>
        <button className="flex-1 py-3 bg-[#111111] rounded-xl hover:bg-green-900/20 transition-all border border-green-500/30 flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Advanced</span>
        </button>
      </div>
    </div>
  );
}