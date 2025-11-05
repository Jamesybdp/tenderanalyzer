export interface LineItem {
  name: string;
  description: string;
  quantity: number | string | null;
  specifications: string | null;
}

export interface Flag {
  priority: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface ScoreBreakdown {
    keywordMatch: number;
    domainFit: number;
    clientMatch: number;
    strategicValue: number;
}

export interface BidAnalysis {
  summary: {
    projectName: string | null;
    issuingEntity: string | null;
    submissionDeadline: string | null;
    bidType: string | null;
    projectManager: string | null;
    estimatedBudget: string | null;
  };
  relevance: {
    isRelevant: boolean;
    relevanceScore: number;
    reasoning: string;
    relevantKeywordsFound: string[];
    scoreBreakdown: ScoreBreakdown | null;
    strategicAlignment: string | null;
  };
  clientCapabilitiesFit: {
    primaryDomain: 'Solar' | 'ICT' | 'Telecomms' | 'Civil Construction' | 'Healthcare' | 'Other' | null;
    offeringMatchDetails: string;
  };
  lineItems: LineItem[];
  requiredDocuments: string[];
  flagsForHumanReview: Flag[];
}

export interface MonitoredTender {
  title: string;
  issuingEntity: string;
  source: string;
  summary: string;
  keywords: string[];
  hypotheticalLink: string;
}

export interface ChecklistSection {
    category: string;
    items: string[];
    notes: string | null;
    userNotes?: string;
}

export type Checklist = ChecklistSection[];

export interface HistoricalAnalysis {
  id: string;
  timestamp: string;
  analysis: BidAnalysis;
}