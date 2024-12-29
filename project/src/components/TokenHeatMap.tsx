import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { tokenAnalyticsService } from '../lib/services/tokenAnalytics';
import type { TokenData } from '../lib/types/helius';

export function TokenHeatMap() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const data = await tokenAnalyticsService.getTopTokens();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching token data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
    const interval = setInterval(fetchTokenData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getChangeColor = (change: number) => {
    if (change > 5) return 'bg-green-500/30 text-green-400';
    if (change > 0) return 'bg-green-500/20 text-green-400';
    if (change < -5) return 'bg-red-500/30 text-red-400';
    return 'bg-red-500/20 text-red-400';
  };

  if (loading) {
    return (
      <div className="p-4 bg-black border border-purple-600/30 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Loading Market Data...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-black border border-purple-600/30 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Solana Token Heat Map
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {tokens.map((token) => (
          <div
            key={token.symbol}
            className={`p-3 rounded-lg ${getChangeColor(token.change24h)} border border-opacity-30`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{token.symbol}</span>
              <div className="flex items-center gap-1">
                {token.change24h > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(token.change24h).toFixed(2)}%</span>
              </div>
            </div>
            <div className="text-sm opacity-80">
              ${token.price.toFixed(4)}
            </div>
            <div className="text-xs opacity-60">
              Vol: ${(token.volume24h / 1000000).toFixed(2)}M
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}