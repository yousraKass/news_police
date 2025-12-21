
// Fix: Integrated Gemini API for authentic analysis and resolved factualClaims property error
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DetectionStatus } from '../types';

/**
 * Leverages Gemini 3 Pro to perform sophisticated analysis on news content, 
 * specifically optimized for Algerian Arabic (Darja) nuances.
 */
export const generateMockAnalysis = async (text: string, meta: { source?: string, category?: string }): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the following news text for authenticity. The text is likely in Algerian Arabic (Darja) or Modern Standard Arabic.
    
    Category: ${meta.category || 'General'}
    Source: ${meta.source || 'Unknown'}
    Text: "${text}"
    
    Determine if the content is 'Real', 'Fake', or 'Satire'. Provide category probabilities, emotional indicators, and linguistic patterns including factual claim counts.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, description: "Must be exactly 'Fake', 'Real', or 'Satire'" },
          confidence: { type: Type.NUMBER, description: "A percentage value from 0 to 100" },
          probabilities: {
            type: Type.OBJECT,
            properties: {
              fake: { type: Type.NUMBER },
              real: { type: Type.NUMBER },
              satire: { type: Type.NUMBER }
            },
            required: ["fake", "real", "satire"]
          },
          indicators: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                textEvidence: { type: Type.STRING }
              },
              required: ["type", "title", "description", "textEvidence"]
            }
          },
          linguisticPatterns: {
            type: Type.OBJECT,
            properties: {
              emotionLevel: { type: Type.STRING, description: "Low, Medium, or High" },
              sourceCitations: { type: Type.NUMBER },
              dialectMarkers: { type: Type.ARRAY, items: { type: Type.STRING } },
              factualClaims: { type: Type.NUMBER }
            },
            required: ["emotionLevel", "sourceCitations", "dialectMarkers", "factualClaims"]
          },
          author: { type: Type.STRING }
        },
        required: ["status", "confidence", "probabilities", "indicators", "linguisticPatterns"]
      }
    }
  });

  const analysis = JSON.parse(response.text);

  return {
    id: Math.random().toString(36).substr(2, 9),
    status: (['Fake', 'Real', 'Satire'].includes(analysis.status) ? analysis.status : 'Fake') as DetectionStatus,
    confidence: analysis.confidence || 85,
    probabilities: analysis.probabilities,
    indicators: analysis.indicators,
    linguisticPatterns: analysis.linguisticPatterns,
    date: new Date().toLocaleDateString('en-GB'),
    timestamp: Date.now(),
    inputText: text,
    metadata: { 
      source: meta.source || 'Social Media', 
      category: meta.category || 'General', 
      author: analysis.author || 'Unknown' 
    }
  };
};
