import React from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

interface AIAnalysisProps {
  analysis: {
    sentiment: string;
    confidence: number;
    signals: {
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }[];
  };
}

export function AIAnalysis({ analysis }: AIAnalysisProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black border border-purple-600/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
          Cheshire AI Analysis
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Sentiment</span>
          <span className="text-purple-400">{analysis.sentiment}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Confidence</span>
          <span className="text-green-400">{(analysis.confidence * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400">Trading Signals</h4>
        {analysis.signals.map((signal, index) => (
          <div
            key={index}
            className="p-2 bg-[#111111] rounded-lg border border-purple-600/20"
          >
            <div className="flex items-center gap-2">
              {signal.type === 'trend' ? (
                <TrendingUp className={`w-4 h-4 ${getSeverityColor(signal.severity)}`} />
              ) : (
                <AlertTriangle className={`w-4 h-4 ${getSeverityColor(signal.severity)}`} />
              )}
              <span className={`text-sm ${getSeverityColor(signal.severity)}`}>
                {signal.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}