import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Settings } from 'lucide-react';
import { useWalletStore } from '../stores/walletStore';

export function WalletConnection() {
  const { publicKey } = useWallet();
  const { customRpcUrl, setCustomRpcUrl } = useWalletStore();
  const [showSettings, setShowSettings] = useState(false);
  const [rpcInput, setRpcInput] = useState(customRpcUrl);

  const handleRpcUpdate = () => {
    setCustomRpcUrl(rpcInput);
    setShowSettings(false);
  };

  return (
    <div className="p-4 bg-[#111111] rounded-xl border border-purple-600/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
          Wallet Connection
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-purple-900/20 rounded-lg transition-all"
        >
          <Settings className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 space-y-2">
          <label className="text-sm text-gray-400">Custom RPC URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={rpcInput}
              onChange={(e) => setRpcInput(e.target.value)}
              className="flex-1 bg-black border border-purple-600/30 rounded-lg p-2 text-white text-sm"
              placeholder="Enter RPC URL"
            />
            <button
              onClick={handleRpcUpdate}
              className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-400 transition-all"
            >
              Update
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {publicKey && (
            <span className="text-sm text-gray-400">
              {`${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}
            </span>
          )}
        </div>
        <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-green-500 !rounded-lg !py-2 !px-4" />
      </div>
    </div>
  );
}