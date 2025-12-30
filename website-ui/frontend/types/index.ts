// src/types/index.ts

export interface AnalysisResult {
  id: string;
  inputText: string;
  status: 'Fake' | 'Real' | 'Satire' | 'Not News';
  confidence: number;
  probabilities: {
    fake: number;
    real: number;
    satire: number;
  };
  indicators: Array<{
    title: string;
    description: string;
  }>;
  linguisticPatterns: {
    emotionLevel: string;
    sourceCitations: number;
    factualClaims: number;
  };
  metadata: {
    source: string;
    category: string;
    date: string;
    mode?: string;
  };
  date: string;
}

export interface HistoryItem extends AnalysisResult {
  timestamp: number;
}

export interface DetectionMetadata {
  source?: string;
  category?: string;
}