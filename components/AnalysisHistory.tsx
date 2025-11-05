import React from 'react';
import type { HistoricalAnalysis, BidAnalysis } from '../types';

interface AnalysisHistoryProps {
  history: HistoricalAnalysis[];
  onView: (analysis: BidAnalysis) => void;
  onClear: () => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, onView, onClear }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-neutral-700 rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-gold">Analysis History</h2>
            <p className="text-neutral-300 text-sm">Review or re-export your past bid analyses.</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
            >
              Clear History
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="text-center text-neutral-400 py-16">
            <p>No past analyses found.</p>
            <p className="text-sm">Completed analyses will be stored here for future reference.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white">{item.analysis.summary.projectName || 'Untitled Analysis'}</h3>
                  <p className="text-sm text-neutral-400">Analyzed on: {item.timestamp}</p>
                </div>
                <button
                  onClick={() => onView(item.analysis)}
                  className="bg-brand-blue hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
