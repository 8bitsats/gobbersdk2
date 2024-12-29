import create from 'zustand';
import { Connection, PublicKey } from '@solana/web3.js';

interface WalletState {
  connection: Connection | null;
  customRpcUrl: string;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  setCustomRpcUrl: (url: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  connection: null,
  customRpcUrl: "https://mainnet.helius-rpc.com/?api-key=e4e7f06a-1e90-4628-8b07-d4f3c30fc5c9",
  publicKey: null,
  connected: false,
  connecting: false,
  error: null,

  setCustomRpcUrl: (url: string) => {
    try {
      const connection = new Connection(url, 'confirmed');
      set({ customRpcUrl: url, connection, error: null });
    } catch (error) {
      set({ error: 'Invalid RPC URL' });
    }
  },

  connect: async () => {
    set({ connecting: true, error: null });
    try {
      if (!window.solana) {
        throw new Error('Solana wallet not found');
      }

      const response = await window.solana.connect();
      const publicKey = new PublicKey(response.publicKey.toString());
      
      set({
        publicKey,
        connected: true,
        connecting: false
      });
    } catch (error) {
      set({
        error: error.message,
        connecting: false
      });
    }
  },

  disconnect: () => {
    if (window.solana) {
      window.solana.disconnect();
    }
    set({
      publicKey: null,
      connected: false
    });
  }
}));