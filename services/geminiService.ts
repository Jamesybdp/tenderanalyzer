import { GoogleGenAI } from "@google/genai";
import { 
    SYSTEM_PROMPT, 
    RESPONSE_SCHEMA, 
    TENDER_MONITOR_PROMPT, 
    TENDER_MONITOR_SCHEMA,
    CHECKLIST_GENERATOR_PROMPT,
    CHECKLIST_GENERATOR_SCHEMA
} from '../constants';
import type { BidAnalysis, MonitoredTender, Checklist } from '../types';

async function callGemini<T>(prompt: string, systemInstruction: string, schema: any): Promise<T> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`API call failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during the API call.");
    }
}


export async function analyzeBid(bidText: string): Promise<BidAnalysis> {
  return callGemini<BidAnalysis>(bidText, SYSTEM_PROMPT, RESPONSE_SCHEMA);
}

export async function findTenders(keywords: string): Promise<MonitoredTender[]> {
    const prompt = `Keywords: "${keywords}"`;
    return callGemini<MonitoredTender[]>(prompt, TENDER_MONITOR_PROMPT, TENDER_MONITOR_SCHEMA);
}

export async function generateChecklist(tenderType: string): Promise<Checklist> {
    const prompt = `Tender Type: "${tenderType}"`;
    return callGemini<Checklist>(prompt, CHECKLIST_GENERATOR_PROMPT, CHECKLIST_GENERATOR_SCHEMA);
}

export async function translateObject(obj: any, targetLanguage: 'Mandarin'): Promise<any> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Translate all user-facing string values in the following JSON object to ${targetLanguage}. Maintain the exact JSON structure and keys. Only translate the string values. Do not translate keywords or enums. Do not add any extra explanations or text outside of the JSON object.\n\n${JSON.stringify(obj, null, 2)}`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/```\s*$/, '');
        return JSON.parse(cleanedJsonText);
    } catch (error) {
        console.error(`Error translating object to ${targetLanguage}:`, error);
        if (error instanceof Error) {
             if (error.name === 'SyntaxError') {
                 throw new Error(`Translation API returned invalid JSON. Response: ${error.message}`);
            }
            throw new Error(`Translation API call failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during the translation API call.");
    }
}
