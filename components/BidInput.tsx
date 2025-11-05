import React from 'react';

interface BidInputProps {
  bidText: string;
  setBidText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const BidInput: React.FC<BidInputProps> = ({ bidText, setBidText, onAnalyze, isLoading }) => {
  return (
    <div className="bg-neutral-700 rounded-lg shadow-xl p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-brand-gold">Tender Document Text</h2>
      <textarea
        value={bidText}
        onChange={(e) => setBidText(e.target.value)}
        placeholder="Paste the full text from the RFP or tender document here..."
        className="w-full h-96 p-4 bg-neutral-800 border border-neutral-600 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow duration-200 resize-y text-neutral-200"
        disabled={isLoading}
      />
      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="mt-6 w-full bg-brand-blue hover:bg-blue-800 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Analyze Bid'
        )}
      </button>
    </div>
  );
};
