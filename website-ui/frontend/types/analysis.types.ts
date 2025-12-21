
export type DetectionStatus = 'Fake' | 'Real' | 'Satire';

export interface Indicator {
  type: string;
  title: string;
  description: string;
  textEvidence: string;
}

export interface LinguisticPatterns {
  emotionLevel: 'Low' | 'Medium' | 'High';
  sourceCitations: number;
  dialectMarkers: string[];
  // Fix: Added factualClaims to match the property provided in analysis generation
  factualClaims: number;
}

export interface AnalysisResult {
  id: string;
  status: DetectionStatus;
  confidence: number;
  probabilities: {
    fake: number;
    real: number;
    satire: number;
  };
  indicators: Indicator[];
  linguisticPatterns: LinguisticPatterns;
  date: string;
  timestamp: number;
  inputText: string;
  metadata: {
    source: string;
    category: string;
    author: string;
  };
}
