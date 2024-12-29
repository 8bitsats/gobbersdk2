import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Send, Loader } from 'lucide-react';
import { useWalletStore } from '../stores/walletStore';

export function TokenTransfer() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useWalletStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!publicKey || !connection) return;
    setLoading(true);
    setError(null);

    try {
      const recipientPubKey = new PublicKey(recipient);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#111111] rounded-xl border border-purple-600/30 mt-4">
      <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent flex items-center gap-2 mb-4">
        <Send className="w-5 h-5 text-purple-400" />
        Send SOL
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-black border border-purple-600/30 rounded-lg p-2 text-white"
            placeholder="Enter Solana address"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Amount (SOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black border border-purple-600/30 rounded-lg p-2 text-white"
            placeholder="0.0"
            min="0"
            step="0.001"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={loading || !recipient || !amount || !publicKey}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-green-500 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          Send SOL
        </button>
      </div>
    </div>
  );
}