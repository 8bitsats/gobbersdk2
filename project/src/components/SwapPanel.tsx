import React from 'react';
import { ArrowDownCircle } from 'lucide-react';
import { TokenInput } from './TokenInput';
import { SwapDetails } from './SwapDetails';
import { ActionButtons } from './ActionButtons';
import { useSwapStore } from '../stores/swapStore';

export function SwapPanel() {
  const {
    inputAmount,
    outputAmount,
    loading,
    error,
    setInputAmount,
    calculateSwap,
    executeSwap
  } = useSwapStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setInputAmount(value);
    calculateSwap();
  };

  return (
    <div className="space-y-4">
      <TokenInput
        label="You Pay"
        value={inputAmount}
        onChange={handleInputChange}
        balance="1.45 SOL"
        token="SOL"
        variant="purple"
      />

      <div className="flex justify-center">
        <button className="p-3 rounded-full bg-gradient-to-r from-purple-600/20 to-green-500/20">
          <ArrowDownCircle className="w-6 h-6 text-green-400" />
        </button>
      </div>

      <TokenInput
        label="You Receive"
        value={outputAmount}
        balance="1,250 $GRIN"
        token="GRIN"
        variant="green"
        readOnly
      />

      <SwapDetails />

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <ActionButtons
        onExecute={executeSwap}
        loading={loading}
        disabled={!inputAmount}
      />
    </div>
  );
}