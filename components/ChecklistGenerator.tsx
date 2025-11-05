import React, { useState } from 'react';
import type { Checklist } from '../types';
import { generateChecklist, translateObject } from '../services/geminiService';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';

type TenderType = 'Public/Government (PRAZ)' | 'Private Corporation' | 'Parastatal Entity (e.g., ZINWA, ZESA)';

export const ChecklistGenerator: React.FC = () => {
    const [tenderType, setTenderType] = useState<TenderType>('Public/Government (PRAZ)');
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const [originalChecklist, setOriginalChecklist] = useState<Checklist | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setChecklist(null);
        setOriginalChecklist(null);
        setIsTranslated(false);

        try {
            const result = await generateChecklist(tenderType);
            setChecklist(result);
            setOriginalChecklist(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred while generating the checklist.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNoteChange = (index: number, note: string) => {
        if (!checklist) return;
        const updatedChecklist = checklist.map((section, i) => 
            i === index ? { ...section, userNotes: note } : section
        );
        setChecklist(updatedChecklist);
    };

    const handleTranslate = async () => {
        if (isTranslating || !originalChecklist) return;
        setIsTranslating(true);
        try {
            if (isTranslated) {
                setChecklist(originalChecklist);
            } else {
                // We translate the original checklist to avoid re-translating user notes
                const translatedChecklist = await translateObject(originalChecklist, 'Mandarin');
                // Re-apply user notes from the current state
                const finalChecklist = translatedChecklist.map((section: any, index: number) => ({
                    ...section,
                    userNotes: checklist?.[index]?.userNotes || ''
                }));
                setChecklist(finalChecklist);
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
                <h2 className="text-2xl font-bold mb-1 text-brand-gold">Dynamic Bid Checklist Generator</h2>
                <p className="text-neutral-300 mb-4 text-sm">Select a tender type to generate a tailored compliance and documentation checklist.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <select
                        value={tenderType}
                        onChange={(e) => setTenderType(e.target.value as TenderType)}
                        className="flex-grow p-3 bg-neutral-800 border border-neutral-600 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow duration-200 text-neutral-200"
                        disabled={isLoading}
                    >
                        <option>Public/Government (PRAZ)</option>
                        <option>Private Corporation</option>
                        <option>Parastatal Entity (e.g., ZINWA, ZESA)</option>
                    </select>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-brand-blue hover:bg-blue-800 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center"
                    >
                        {isLoading ? 'Generating...' : 'Generate Checklist'}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {isLoading && <Loader />}
                {error && <ErrorMessage message={error} />}
                {checklist && (
                    <div className="bg-neutral-700 rounded-lg shadow-lg p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-neutral-600 pb-3">
                            <h3 className="text-xl font-bold text-brand-gold">Compliance Checklist for: <span className="text-white">{tenderType}</span></h3>
                             <button
                                onClick={handleTranslate}
                                disabled={isTranslating || !checklist}
                                className="text-sm bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-800 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                            >
                                {isTranslating ? 'Translating...' : (isTranslated ? 'Show English' : 'Translate to Mandarin')}
                            </button>
                        </div>
                        {checklist.map((section, index) => (
                            <div key={index}>
                                <h4 className="text-lg font-semibold text-brand-gold mb-2">{section.category}</h4>
                                <ul className="space-y-2 list-disc list-inside text-neutral-200 pl-2">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="text-sm">{item}</li>
                                    ))}
                                </ul>
                                {section.notes && (
                                    <p className="text-xs text-neutral-400 mt-3 border-l-2 border-brand-gold pl-3 italic">
                                        <strong>Note:</strong> {section.notes}
                                    </p>
                                )}
                                <div className="mt-3">
                                    <textarea
                                        value={section.userNotes || ''}
                                        onChange={(e) => handleNoteChange(index, e.target.value)}
                                        placeholder="Add custom notes here..."
                                        className="w-full p-2 text-sm bg-neutral-800 border border-neutral-600 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow duration-200"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {!isLoading && !error && !checklist && (
                    <div className="text-center text-neutral-400 pt-10">
                        <p>Your generated compliance checklist will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
