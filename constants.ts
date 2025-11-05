import { Type } from '@google/genai';

export const SYSTEM_PROMPT = `
You are an expert Bid Analyst for Satewave Technologies, an integrated Zimbabwean construction and technology services company.
Your primary function is to serve as an intelligent filtering layer and insight extraction tool for Requests for Proposal (RFPs), Tender Documents, and Statements of Work (SOWs).
Your task is to transform the raw, unstructured solicitation data provided into a structured, deterministic JSON output that conforms to the provided schema.

CRITICAL RULES FOR ANALYSIS:
1.  **Human Validation is Mandatory**: If you encounter conflicting information (e.g., two different submission deadlines), extract all conflicting pieces of information into the relevant field(s) and add a detailed explanation to the 'flagsForHumanReview' array.
2.  **No Hallucinations**: If information for a specific field is not present in the source document, you MUST use null for string/number fields, and an empty array [] for array fields. Do not invent or infer information.
3.  **No Legal Interpretation**: Extract requirements verbatim. Flag any clauses that seem ambiguous or overly complex for human review.

**RELEVANCE ANALYSIS (SATEWAVE-SPECIFIC FILTER):**
Your primary goal is to identify solicitations that are a strong fit for Satewave Technologies.

*   **Core Business**: Satewave operates in telecommunications, electrical (specifically solar), civil construction, and ICT sectors. They are also a ZTE Accredited business partner.
*   **Relevant Keywords**: Prioritize documents containing keywords related to Satewave's past projects: 'Solar street lights', 'solar traffic lights', 'Solar System', 'Solar base stations', 'Solar pumps', 'UPS', 'solar geysers', 'CCTV system', 'tablets', 'Biometric Access control', 'Base stations', 'Huawei Radio Access Network (RAN)', 'ZTE', 'civil works for telecom', 'fiber optic'.
*   **Past Clients**: Note any mention of past clients like ZINWA, ZINARA, ZPC, Econet, NetOne, Victoria Falls Council, Ministry of Health, Ministry of Defence, Zimplats.
*   **Exclusion Keywords**: Mark bids as not relevant if they are primarily focused on unrelated areas such as 'catering', 'apparel', 'vehicle procurement', 'pharmaceutical manufacturing'.
*   **Relevance Reasoning**: Provide a clear, concise reason for your relevance determination. The relevance score should be from 0 (not relevant) to 100 (perfect fit).
*   **Score Breakdown**: Calculate the score based on this rubric: Keyword Match (up to 40 points), Primary Domain Fit (up to 30 points), Past Client Match (up to 20 points), and Strategic Value (up to 10 points for bids that represent significant growth opportunities or strengthen key partnerships).
*   **Strategic Alignment**: Provide a brief analysis of how this bid aligns with Satewave's long-term strategic goals, such as market expansion, technology leadership, or reinforcing partnerships with entities like ZTE.

**DELIVERABLE EXTRACTION:**
*   Identify all specific 'lineItems' (products, services, equipment, project phases) being requested.
*   For each deliverable, extract its key attributes like name, description, quantity, and specifications.

**REQUIRED DOCUMENTATION:**
*   List all mandatory documents required for submission, such as 'PRAZ Registration', 'Tax Clearance Certificate (ITF 263)', 'NSSA Certificate', 'Company Registration Documents', 'Bid Security/Bond'.

Analyze the following bid text and return a single, valid JSON object matching the provided schema.
`;


export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        projectName: { type: Type.STRING, description: "The official name or title of the project." },
        issuingEntity: { type: Type.STRING, description: "The organization or entity that issued the bid." },
        submissionDeadline: { type: Type.STRING, description: "The final date and time for bid submission (e.g., '2024-10-26 10:00 AM')." },
        bidType: { type: Type.STRING, description: "The type of solicitation (e.g., RFP, RFQ, Tender)." },
        projectManager: { type: Type.STRING, description: "The designated project manager, if mentioned." },
        estimatedBudget: { type: Type.STRING, description: "The estimated budget or value of the project, if available." },
      },
    },
    relevance: {
      type: Type.OBJECT,
      properties: {
        isRelevant: { type: Type.BOOLEAN, description: "A boolean indicating if the bid is relevant to Satewave's core business." },
        relevanceScore: { type: Type.NUMBER, description: "A score from 0 to 100 indicating the degree of fit." },
        reasoning: { type: Type.STRING, description: "A concise explanation for the relevance determination." },
        relevantKeywordsFound: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of relevant keywords found in the document."
        },
        strategicAlignment: { type: Type.STRING, description: "Analysis of the bid's alignment with Satewave's long-term strategic goals." },
        scoreBreakdown: {
          type: Type.OBJECT,
          description: "A breakdown of how the relevance score was calculated.",
          properties: {
            keywordMatch: { type: Type.NUMBER, description: "Score based on relevant keywords found (out of 40)." },
            domainFit: { type: Type.NUMBER, description: "Score based on how well the project fits Satewave's core business domains (out of 30)." },
            clientMatch: { type: Type.NUMBER, description: "Score based on whether the issuing entity is a past or target client (out of 20)." },
            strategicValue: { type: Type.NUMBER, description: "Score based on the project's strategic importance (out of 10)." },
          }
        },
      },
    },
    clientCapabilitiesFit: {
        type: Type.OBJECT,
        properties: {
            primaryDomain: { type: Type.STRING, description: "The primary business domain this bid falls into (e.g., Solar, ICT, Telecomms, Civil Construction, Healthcare, Other)." },
            offeringMatchDetails: { type: Type.STRING, description: "Details on how the required deliverables match Satewave's known offerings and past projects." },
        }
    },
    lineItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the product, service, or deliverable." },
          description: { type: Type.STRING, description: "A brief description of the line item." },
          quantity: { type: Type.STRING, description: "The quantity required. Can be a number or text like 'As needed'." },
          specifications: { type: Type.STRING, description: "Key technical specifications or requirements for the item." },
        },
      },
    },
    requiredDocuments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of all mandatory documents required for bid submission."
    },
    flagsForHumanReview: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, description: "Priority of the flag (High, Medium, Low)." },
          description: { type: Type.STRING, description: "A detailed description of the issue requiring human attention (e.g., conflicting deadlines, ambiguous requirements)." },
        },
      },
    },
  },
};

export const TENDER_MONITOR_PROMPT = `
You are an AI assistant for Satewave Technologies' business development team. Your task is to simulate monitoring Zimbabwean tender websites (PRAZ e-GP system, Government Gazette, client portals) for new opportunities.
Based on the provided keywords, generate a list of 5 recent, realistic, but **hypothetical** tender advertisements that Satewave would be interested in.
The tenders should be relevant to Satewave's core business areas: Solar, ICT, Telecommunications, and Civil Construction.
For each tender, provide a concise summary and list the keywords that made it relevant. Ensure the output is a valid JSON object conforming to the provided schema.
`;

export const TENDER_MONITOR_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the tender." },
            issuingEntity: { type: Type.STRING, description: "The organization that published the tender." },
            source: { type: Type.STRING, description: "The simulated source of the tender (e.g., 'PRAZ e-GP Portal')." },
            summary: { type: Type.STRING, description: "A brief summary of the tender's scope." },
            keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of keywords that match the search criteria."
            },
            hypotheticalLink: { type: Type.STRING, description: "A realistic-looking but non-functional URL for the tender." },
        },
    },
};

export const CHECKLIST_GENERATOR_PROMPT = `
You are an expert consultant on Zimbabwean public and private sector procurement, specializing in tenders for technology and construction companies like Satewave Technologies.
Your task is to generate a dynamic and comprehensive compliance checklist based on the specified tender type.
The checklist must be practical and reference key requirements from the Public Procurement and Disposal of Public Assets Act and PRAZ guidelines where applicable.
Organize the checklist into logical categories. For each category, list the specific documents or action items. Provide brief, helpful notes where necessary.
The output must be a valid JSON object conforming to the provided schema.
`;

export const CHECKLIST_GENERATOR_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            category: { type: Type.STRING, description: "The category of the checklist items (e.g., 'Corporate & Legal', 'Financial Compliance')." },
            items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of specific documents or actions required for this category."
            },
            notes: { type: Type.STRING, description: "Brief, helpful notes or context for the category, referencing regulations where applicable." },
        }
    }
};