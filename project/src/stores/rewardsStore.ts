import create from 'zustand';

interface RewardsState {
  points: number;
  tier: string;
  multiplier: number;
  nextTierPoints: number;
  nextReward: number;
  addPoints: (amount: number) => void;
  calculateMultiplier: () => void;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  points: 150,
  tier: 'Explorer',
  multiplier: 2,
  nextTierPoints: 350,
  nextReward: 50,

  addPoints: (amount) => {
    const { points, multiplier } = get();
    set({ points: points + (amount * multiplier) });
    get().calculateMultiplier();
  },

  calculateMultiplier: () => {
    const { points } = get();
    const isWeekend = [0, 6].includes(new Date().getDay());
    const baseMultiplier = Math.floor(points / 1000) + 1;
    const weekendBonus = isWeekend ? 1.5 : 1;
    set({ multiplier: baseMultiplier * weekendBonus });
  }
}));