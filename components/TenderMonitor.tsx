import React, { useState, useEffect } from 'react';
import type { MonitoredTender } from '../types';
import { findTenders, translateObject } from '../services/geminiService';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';

export const TenderMonitor: React.FC = () => {
    const [keywords, setKeywords] = useState<string>('');
    const [results, setResults] = useState<MonitoredTender[] | null>(null);
    const [originalResults, setOriginalResults] = useState<MonitoredTender[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        const savedKeywords = localStorage.getItem('tenderMonitorKeywords');
        setKeywords(savedKeywords || 'Solar, ICT, Huawei RAN');
    }, []);

    const handleSearch = async () => {
        if (!keywords.trim()) {
            setError('Please enter keywords to search for tenders.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults(null);
        setOriginalResults(null);
        setIsTranslated(false);
        localStorage.setItem('tenderMonitorKeywords', keywords);

        try {
            const tenderResults = await findTenders(keywords);
            setResults(tenderResults);
            setOriginalResults(tenderResults);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred while searching for tenders.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleTranslate = async () => {
        if (isTranslating || !originalResults) return;
        setIsTranslating(true);
        try {
            if (isTranslated) {
                setResults(originalResults);
            } else {
                const translatedResults = await translateObject(originalResults, 'Mandarin');
                setResults(translatedResults);
            }
            setIsTranslated(!isTranslated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Translation failed.');
        } finally {
            setIsTranslating(false);
        }
    };


    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-neutral-700 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-1 text-brand-gold">Simulated Tender Monitor</h2>
                <p className="text-neutral-300 mb-4 text-sm">Enter keywords to discover hypothetical tender opportunities relevant to Satewave.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., Solar, CCTV, Base Station"
                        className="flex-grow p-3 bg-neutral-800 border border-neutral-600 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow duration-200 text-neutral-200"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="bg-brand-blue hover:bg-blue-800 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center"
                    >
                        {isLoading ? 'Searching...' : 'Search Tenders'}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {isLoading && <Loader />}
                {error && <ErrorMessage message={error} />}
                {results && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleTranslate}
                                disabled={isTranslating || !results}
                                className="text-sm bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-800 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                            >
                                {isTranslating ? 'Translating...' : (isTranslated ? 'Show English' : 'Translate to Mandarin')}
                            </button>
                        </div>
                        <div className="space-y-4">
                            {results.map((tender, index) => (
                                <div key={index} className="bg-neutral-700 rounded-lg shadow-lg p-5 transition-transform hover:scale-[1.02] duration-200">
                                    <h3 className="text-xl font-bold text-brand-gold">{tender.title}</h3>
                                    <p className="text-sm font-semibold text-neutral-300 mt-1">
                                        <span className="font-normal">From:</span> {tender.issuingEntity} | <span className="font-normal">Source:</span> {tender.source}
                                    </p>
                                    <p className="text-neutral-200 mt-3 text-sm">{tender.summary}</p>
                                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                                        <span className="text-xs font-bold mr-2">Matched Keywords:</span>
                                        {tender.keywords.map((kw, i) => (
                                            <span key={i} className="bg-brand-blue/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">{kw}</span>
                                        ))}
                                    </div>
                                    <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-400 hover:text-blue-300 text-xs mt-3 inline-block cursor-not-allowed" title="This is a hypothetical link">
                                        {tender.hypotheticalLink}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                 {!isLoading && !error && !results && (
                    <div className="text-center text-neutral-400 pt-10">
                        <p>Tender search results will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
