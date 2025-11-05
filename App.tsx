import React, { useState, useEffect } from 'react';
import { BidInput } from './components/BidInput';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { TenderMonitor } from './components/TenderMonitor';
import { ChecklistGenerator } from './components/ChecklistGenerator';
import { AnalysisHistory } from './components/AnalysisHistory';
import { analyzeBid } from './services/geminiService';
import type { BidAnalysis, HistoricalAnalysis } from './types';

type View = 'analyzer' | 'monitor' | 'checklist' | 'history';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('analyzer');
  const [bidText, setBidText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<BidAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoricalAnalysis[]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('bidAnalysisHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!bidText.trim()) {
      setError('Please paste the bid document text before analyzing.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeBid(bidText);
      setAnalysisResult(result);
      
      const newHistoryEntry: HistoricalAnalysis = {
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
        analysis: result,
      };
      
      setHistory(prevHistory => {
        const updatedHistory = [newHistoryEntry, ...prevHistory];
        localStorage.setItem('bidAnalysisHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistoryItem = (analysis: BidAnalysis) => {
    setAnalysisResult(analysis);
    setActiveView('analyzer');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the entire analysis history? This cannot be undone.')) {
        setHistory([]);
        localStorage.removeItem('bidAnalysisHistory');
    }
  };


  const renderContent = () => {
    switch (activeView) {
      case 'monitor':
        return <TenderMonitor />;
      case 'checklist':
        return <ChecklistGenerator />;
      case 'history':
        return <AnalysisHistory history={history} onView={handleViewHistoryItem} onClear={handleClearHistory} />;
      case 'analyzer':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <BidInput
              bidText={bidText}
              setBidText={setBidText}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
            <div className="bg-neutral-700 rounded-lg shadow-xl p-6 min-h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-brand-gold">Analysis Output</h2>
              {isLoading && <Loader />}
              {error && <ErrorMessage message={error} />}
              {analysisResult && !isLoading && <AnalysisResultDisplay result={analysisResult} />}
              {!isLoading && !error && !analysisResult && (
                <div className="flex-grow flex items-center justify-center text-neutral-400">
                  <p>Your bid analysis will appear here.</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };


  return (
    <div className="min-h-screen bg-neutral-800 text-neutral-200 font-sans">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
