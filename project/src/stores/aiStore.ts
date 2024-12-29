import create from 'zustand';
import { CheshireAI } from '../lib/ai';
import { useSwapStore } from './swapStore';

interface AIState {
  messages: Array<{
    role: 'assistant' | 'user';
    content: string;
  }>;
  loading: boolean;
  suggestions: string[];
  addMessage: (message: string, role: 'assistant' | 'user') => void;
  sendMessage: (message: string) => Promise<void>;
  analyzeTrade: () => Promise<void>;
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  loading: false,
  suggestions: [],

  addMessage: (content, role) => {
    set(state => ({
      messages: [...state.messages, { role, content }]
    }));
  },

  sendMessage: async (message) => {
    set({ loading: true });
    try {
      const swapState = useSwapStore.getState();
      const response = await CheshireAI.chat(message, {
        currentTrade: {
          inputToken: swapState.inputToken,
          outputToken: swapState.outputToken,
          amount: swapState.inputAmount,
          priceImpact: swapState.priceImpact
        }
      });

      get().addMessage(message, 'user');
      get().addMessage(response, 'assistant');
    } catch (error) {
      console.error('AI chat error:', error);
    } finally {
      set({ loading: false });
    }
  },

  analyzeTrade: async () => {
    set({ loading: true });
    try {
      const { inputToken, outputToken, inputAmount, priceImpact } = useSwapStore.getState();
      
      const [tradeAdvice, swapSuggestion] = await Promise.all([
        CheshireAI.getTradeAdvice(inputToken, outputToken, inputAmount),
        CheshireAI.getSwapSuggestion(priceImpact, inputAmount)
      ]);

      set({
        suggestions: [tradeAdvice, swapSuggestion]
      });
    } catch (error) {
      console.error('Trade analysis error:', error);
    } finally {
      set({ loading: false });
    }
  }
}));