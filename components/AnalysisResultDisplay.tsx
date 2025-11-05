import React, { useState, useEffect } from 'react';
import type { BidAnalysis, Flag, LineItem } from '../types';
import { translateObject } from '../services/geminiService';

interface AnalysisResultDisplayProps {
  result: BidAnalysis;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-neutral-800 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold text-brand-gold mb-2">{title}</h3>
        {children}
    </div>
);

const SummaryCard: React.FC<{ summary: BidAnalysis['summary'] }> = ({ summary }) => (
    <InfoCard title="Project Summary">
        <ul className="space-y-2 text-sm">
            <li><strong>Project Name:</strong> {summary.projectName || 'N/A'}</li>
            <li><strong>Issuing Entity:</strong> {summary.issuingEntity || 'N/A'}</li>
            <li><strong>Submission Deadline:</strong> {summary.submissionDeadline || 'N/A'}</li>
            <li><strong>Bid Type:</strong> {summary.bidType || 'N/A'}</li>
            <li><strong>Project Manager:</strong> {summary.projectManager || 'N/A'}</li>
            <li><strong>Estimated Budget:</strong> {summary.estimatedBudget || 'N/A'}</li>
        </ul>
    </InfoCard>
);

const RelevanceCard: React.FC<{ relevance: BidAnalysis['relevance'] }> = ({ relevance }) => {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const scoreColor = relevance.relevanceScore > 70 ? 'text-green-400' : relevance.relevanceScore > 40 ? 'text-yellow-400' : 'text-red-400';
    const relevanceBg = relevance.isRelevant ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500';

    return (
        <InfoCard title="Relevance Analysis">
            <div className={`p-3 rounded-md border ${relevanceBg} mb-3`}>
                <p className="font-bold text-center">
                    {relevance.isRelevant ? '✔️ Relevant' : '❌ Not Relevant'}
                </p>
            </div>
            <div className="text-sm mb-2">
                <strong>Relevance Score:</strong>
                <button 
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className={`ml-2 text-left font-bold text-lg ${scoreColor} hover:underline focus:outline-none focus:ring-2 focus:ring-brand-gold rounded px-1`}
                    aria-expanded={showBreakdown}
                    aria-controls="score-breakdown"
                >
                    {relevance.relevanceScore}/100 {showBreakdown ? '▲' : '▼'}
                </button>
            </div>
            {showBreakdown && relevance.scoreBreakdown && (
                <div id="score-breakdown" className="bg-neutral-900/50 p-3 rounded-md mb-3 text-xs">
                    <h4 className="font-bold mb-2">Score Calculation:</h4>
                    <ul className="space-y-1">
                        <li><strong>Keyword Match:</strong> {relevance.scoreBreakdown.keywordMatch} / 40</li>
                        <li><strong>Domain Fit:</strong> {relevance.scoreBreakdown.domainFit} / 30</li>
                        <li><strong>Client Match:</strong> {relevance.scoreBreakdown.clientMatch} / 20</li>
                        <li><strong>Strategic Value:</strong> {relevance.scoreBreakdown.strategicValue} / 10</li>
                    </ul>
                </div>
            )}
            <p className="text-sm mb-3"><strong>Reasoning:</strong> {relevance.reasoning}</p>
             {relevance.strategicAlignment && (
                <div className="mt-3">
                    <h4 className="font-semibold text-sm mb-1 text-neutral-300">Strategic Alignment:</h4>
                    <p className="text-sm border-l-2 border-brand-gold pl-3">{relevance.strategicAlignment}</p>
                </div>
            )}
            {relevance.relevantKeywordsFound.length > 0 && (
                 <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-1">Keywords Found:</h4>
                    <div className="flex flex-wrap gap-2">
                        {relevance.relevantKeywordsFound.map((keyword, index) => (
                            <span key={index} className="bg-brand-blue text-white text-xs font-medium px-2.5 py-1 rounded-full">{keyword}</span>
                        ))}
                    </div>
                </div>
            )}
        </InfoCard>
    );
};

const CapabilitiesFitCard: React.FC<{ fit: BidAnalysis['clientCapabilitiesFit'] }> = ({ fit }) => (
    <InfoCard title="Capabilities Fit">
         <p className="text-sm mb-2"><strong>Primary Domain:</strong> <span className="font-semibold">{fit.primaryDomain || 'N/A'}</span></p>
         <p className="text-sm"><strong>Offering Match:</strong> {fit.offeringMatchDetails || 'N/A'}</p>
    </InfoCard>
);


const LineItemsCard: React.FC<{ items: LineItem[] }> = ({ items }) => (
    <InfoCard title="Line Items / Deliverables">
        {items.length > 0 ? (
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="bg-neutral-600/50 p-3 rounded">
                        <p className="font-bold">{item.name || 'Unnamed Item'}</p>
                        <p className="text-sm text-neutral-300 mt-1">{item.description}</p>
                        <div className="text-xs mt-2 grid grid-cols-2 gap-2">
                            <span><strong>Quantity:</strong> {item.quantity || 'N/A'}</span>
                            <span><strong>Specs:</strong> {item.specifications || 'N/A'}</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : <p className="text-sm text-neutral-400">No specific line items identified.</p>}
    </InfoCard>
);

const RequiredDocsCard: React.FC<{ docs: string[] }> = ({ docs }) => (
    <InfoCard title="Required Documents">
        {docs.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm">
                {docs.map((doc, index) => <li key={index}>{doc}</li>)}
            </ul>
        ) : <p className="text-sm text-neutral-400">No specific documents listed for submission.</p>}
    </InfoCard>
);

const FlagsCard: React.FC<{ flags: Flag[] }> = ({ flags }) => {
    const getPriorityClass = (priority: Flag['priority']) => {
        switch (priority) {
            case 'High': return 'border-red-500 bg-red-500/20';
            case 'Medium': return 'border-yellow-500 bg-yellow-500/20';
            case 'Low': return 'border-blue-500 bg-blue-500/20';
            default: return 'border-neutral-500 bg-neutral-500/20';
        }
    };
    return (
        <InfoCard title="🚩 Flags for Human Review">
            {flags.length > 0 ? (
                 <div className="space-y-2">
                    {flags.map((flag, index) => (
                        <div key={index} className={`p-3 border-l-4 rounded ${getPriorityClass(flag.priority)}`}>
                            <p className="font-semibold">{flag.priority} Priority:</p>
                            <p className="text-sm text-neutral-300">{flag.description}</p>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-neutral-400">No critical issues flagged for review.</p>}
        </InfoCard>
    );
};


export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
  const [displayedResult, setDisplayedResult] = useState<BidAnalysis>(result);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  
  useEffect(() => {
    setDisplayedResult(result);
    setIsTranslated(false);
    setTranslationError(null);
  }, [result]);

  const handleTranslate = async () => {
      if (isTranslating) return;
      setIsTranslating(true);
      setTranslationError(null);
      try {
          if (isTranslated) {
              setDisplayedResult(result);
          } else {
              const translatedResult = await translateObject(result, 'Mandarin');
              setDisplayedResult(translatedResult);
          }
          setIsTranslated(!isTranslated);
      } catch (err) {
          setTranslationError(err instanceof Error ? err.message : 'Failed to translate.');
      } finally {
          setIsTranslating(false);
      }
  };


  return (
    <div className="h-full overflow-y-auto pr-2">
        <div className="flex justify-end mb-2">
            <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="text-sm bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-800 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
                {isTranslating ? 'Translating...' : (isTranslated ? 'Show English' : 'Translate to Mandarin')}
            </button>
        </div>
        {translationError && <p className="text-red-400 text-sm text-right mb-2">{translationError}</p>}
        <RelevanceCard relevance={displayedResult.relevance} />
        <FlagsCard flags={displayedResult.flagsForHumanReview} />
        <SummaryCard summary={displayedResult.summary} />
        <CapabilitiesFitCard fit={displayedResult.clientCapabilitiesFit} />
        <LineItemsCard items={displayedResult.lineItems} />
        <RequiredDocsCard docs={displayedResult.requiredDocuments} />
    </div>
  );
};