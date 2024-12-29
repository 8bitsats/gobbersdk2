import React, { useState, useEffect } from 'react';
import { Terminal, MessageCircle, Loader } from 'lucide-react';
import { useAIStore } from '../stores/aiStore';
import { useSwapStore } from '../stores/swapStore';

export function CheshireTerminal() {
  const [message, setMessage] = useState('');
  const { messages, loading, suggestions, sendMessage, analyzeTrade } = useAIStore();
  const { inputAmount } = useSwapStore();

  useEffect(() => {
    if (inputAmount > 0) {
      analyzeTrade();
    }
  }, [inputAmount, analyzeTrade]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
  };

  return (
    <div className="p-4 bg-[#111111] rounded-xl border border-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.1)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-400" />
          Cheshire Terminal
          {loading && <Loader className="w-4 h-4 text-purple-400 animate-spin" />}
        </h3>
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-[#0A0A0A] border border-purple-600/30"
          >
            <div className="text-sm text-gray-300">{suggestion}</div>
          </div>
        ))}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === 'assistant'
                ? 'bg-[#0A0A0A] border-purple-600/30'
                : 'bg-[#1A1A1A] border-green-500/30'
            } border`}
          >
            <div className="text-sm text-gray-300">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#0A0A0A] border border-purple-600/30 rounded-lg p-2 text-white"
          placeholder="Ask Cheshire Terminal..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="p-2 bg-[#0A0A0A] rounded-lg hover:bg-purple-900/20 transition-all border border-purple-600/30 disabled:opacity-50"
        >
          <MessageCircle className="w-5 h-5 text-purple-400" />
        </button>
      </div>
    </div>
  );
}