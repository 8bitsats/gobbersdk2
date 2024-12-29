import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { tokenAnalyticsService } from '../lib/tokenAnalyticsService';

interface PortfolioToken {
  symbol: string;
  balance: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
}

export function WalletPortfolio() {
  const { publicKey } = useWallet();
  const [portfolio, setPortfolio] = useState<PortfolioToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!publicKey) return;
      
      try {
        setLoading(true);
        const data = await tokenAnalyticsService.getWalletPortfolio(publicKey.toString());
        setPortfolio(data.tokens);
        setTotalValue(data.totalValue);
        setTotalPnl(data.totalPnl);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) {
      fetchPortfolio();
    }
  }, [publicKey]);

  if (!publicKey) {
    return null;
  }

  return (
    <div className="p-4 bg-black border border-purple-600/30 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Portfolio Overview
          </h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Value</div>
          <div className="text-lg font-bold text-purple-400">
            ${totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {portfolio.map((token) => (
          <div
            key={token.symbol}
            className="p-3 bg-[#111111] rounded-lg border border-purple-600/20"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">{token.symbol}</div>
                <div className="text-sm text-gray-400">
                  Balance: {token.balance.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white">${token.value.toLocaleString()}</div>
                <div className={`text-sm flex items-center gap-1 ${
                  token.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.pnl >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(token.pnlPercentage).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}