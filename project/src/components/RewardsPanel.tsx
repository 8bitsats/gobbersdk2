import React from 'react';
import { Gift, BadgeCheck } from 'lucide-react';
import { useRewardsStore } from '../stores/rewardsStore';

export function RewardsPanel() {
  const { points, nextTierPoints, multiplier, nextReward } = useRewardsStore();
  const progress = ((points % 500) / 5);

  return (
    <div className="p-4 bg-[#111111] rounded-xl border border-green-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
      <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-green-400" />
        Rewards
      </h3>
      
      <div className="space-y-4">
        <div className="w-full bg-[#0A0A0A] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-green-400">{nextTierPoints} points to next tier</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-400">
            <BadgeCheck className="w-4 h-4" />
            <span>{multiplier}x points active</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <BadgeCheck className="w-4 h-4" />
            <span>Next reward: {nextReward} points</span>
          </div>
        </div>
      </div>
    </div>
  );
}