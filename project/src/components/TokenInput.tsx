import React from 'react';

interface TokenInputProps {
  label: string;
  value: number;
  balance: string;
  token: string;
  variant: 'purple' | 'green';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export function TokenInput({
  label,
  value,
  balance,
  token,
  variant,
  onChange,
  readOnly
}: TokenInputProps) {
  const colors = {
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-600/30',
      hover: 'hover:bg-purple-900/20'
    },
    green: {
      text: 'text-green-400',
      border: 'border-green-500/30',
      hover: 'hover:bg-green-900/20'
    }
  };

  const { text, border, hover } = colors[variant];

  return (
    <div className={`p-4 bg-[#111111] rounded-xl border ${border}`}>
      <div className="flex justify-between mb-2">
        <label className={text}>{label}</label>
        <span className="text-gray-500">Balance: {balance}</span>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="number"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`flex-1 bg-black border ${border} rounded-lg p-4 text-white`}
          placeholder="0.0"
        />
        <button className={`flex items-center gap-2 px-4 py-3 bg-[#111111] rounded-lg ${hover} transition-all border ${border}`}>
          <span className={text}>{token === 'SOL' ? '◎' : '😺'} {token}</span>
        </button>
      </div>
    </div>
  );
}