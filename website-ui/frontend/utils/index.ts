// src/utils/index.ts
import { AnalysisResult, HistoryItem } from '../types';
import { newsAPI, PredictionResponse } from '../services/api';

// Storage key for history
const HISTORY_KEY = 'news-police-history';

/**
 * Generate mock analysis result (simulation mode)
 * This simulates the ML model response until the real backend is connected
 */
export async function generateMockAnalysis(
  text: string,
  metadata?: { source?: string; category?: string }
): Promise<AnalysisResult> {
  // Simulate API delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Try to get real prediction first (if backend is available)
  let prediction: PredictionResponse | null = null;
  try {
    const isBackendAvailable = await newsAPI.healthCheck();
    if (isBackendAvailable) {
      prediction = await newsAPI.predict(text);
    }
  } catch (error) {
    console.log('Backend not available, using mock mode');
  }

  // If we have real prediction, use it
  if (prediction && prediction.mode !== 'mock') {
    return convertPredictionToResult(text, prediction, metadata);
  }

  // Otherwise, generate realistic mock data
  return generateRealisticMock(text, metadata);
}

/**
 * Convert API prediction to AnalysisResult format
 */
function convertPredictionToResult(
  text: string,
  prediction: PredictionResponse,
  metadata?: { source?: string; category?: string }
): AnalysisResult {
  const statusMap = {
    'Not_fake': 'Real',
    'fake': 'Fake',
    'satire': 'Satire',
    'not_news': 'Not News'
  } as const;

  const status = statusMap[prediction.predicted_class] || 'Real';

  return {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    inputText: text,
    status,
    confidence: Math.round(prediction.confidence * 100),
    probabilities: {
      fake: prediction.all_probabilities.fake,
      real: prediction.all_probabilities.Not_fake,
      satire: prediction.all_probabilities.satire
    },
    indicators: generateIndicators(status, text),
    linguisticPatterns: analyzeLinguisticPatterns(text),
    metadata: {
      source: metadata?.source || 'Direct Input',
      category: metadata?.category || 'General',
      date: new Date().toISOString()
    },
    date: new Date().toLocaleDateString('en-GB')
  };
}

/**
 * Generate realistic mock analysis
 */
function generateRealisticMock(
  text: string,
  metadata?: { source?: string; category?: string }
): AnalysisResult {
  // Analyze text characteristics to determine realistic classification
  const textLower = text.toLowerCase();
  
  // Keywords that suggest fake news
  const fakeKeywords = ['عاجل', 'خطير', 'مؤامرة', 'سري', 'حصري', 'مفاجأة'];
  const fakeCount = fakeKeywords.filter(kw => text.includes(kw)).length;
  
  // Keywords that suggest satire
  const satireKeywords = ['رسميا', 'فيفا', 'تقرر', 'بسبب'];
  const satireCount = satireKeywords.filter(kw => text.includes(kw)).length;
  
  // Keywords that suggest real news
  const realKeywords = ['وزارة', 'تعلن', 'حملة', 'وطنية', 'ابتداء'];
  const realCount = realKeywords.filter(kw => text.includes(kw)).length;

  // Determine classification based on keyword analysis
  let status: 'Fake' | 'Real' | 'Satire' = 'Real';
  let confidence = 75;
  let probabilities = {
    fake: 0.15,
    real: 0.70,
    satire: 0.15
  };

  if (fakeCount >= 2) {
    status = 'Fake';
    confidence = 65 + Math.random() * 20;
    probabilities = {
      fake: 0.60 + Math.random() * 0.25,
      real: 0.15 + Math.random() * 0.15,
      satire: 0.10 + Math.random() * 0.10
    };
  } else if (satireCount >= 2) {
    status = 'Satire';
    confidence = 55 + Math.random() * 25;
    probabilities = {
      fake: 0.20 + Math.random() * 0.15,
      real: 0.20 + Math.random() * 0.15,
      satire: 0.50 + Math.random() * 0.25
    };
  } else if (realCount >= 2) {
    status = 'Real';
    confidence = 80 + Math.random() * 15;
    probabilities = {
      fake: 0.05 + Math.random() * 0.10,
      real: 0.75 + Math.random() * 0.20,
      satire: 0.05 + Math.random() * 0.10
    };
  } else {
    // Random but realistic distribution
    const rand = Math.random();
    if (rand < 0.6) {
      status = 'Real';
      confidence = 70 + Math.random() * 20;
      probabilities = {
        fake: 0.10 + Math.random() * 0.15,
        real: 0.65 + Math.random() * 0.20,
        satire: 0.10 + Math.random() * 0.15
      };
    } else if (rand < 0.85) {
      status = 'Fake';
      confidence = 60 + Math.random() * 25;
      probabilities = {
        fake: 0.55 + Math.random() * 0.25,
        real: 0.20 + Math.random() * 0.15,
        satire: 0.10 + Math.random() * 0.15
      };
    } else {
      status = 'Satire';
      confidence = 50 + Math.random() * 30;
      probabilities = {
        fake: 0.15 + Math.random() * 0.20,
        real: 0.15 + Math.random() * 0.20,
        satire: 0.45 + Math.random() * 0.30
      };
    }
  }

  // Normalize probabilities to sum to 1
  const sum = probabilities.fake + probabilities.real + probabilities.satire;
  probabilities = {
    fake: probabilities.fake / sum,
    real: probabilities.real / sum,
    satire: probabilities.satire / sum
  };

  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    inputText: text,
    status,
    confidence: Math.round(confidence),
    probabilities,
    indicators: generateIndicators(status, text),
    linguisticPatterns: analyzeLinguisticPatterns(text),
    metadata: {
      source: metadata?.source || 'Direct Input',
      category: metadata?.category || 'General',
      date: new Date().toISOString(),
      mode: 'simulation' // Flag to indicate this is simulated
    },
    date: new Date().toLocaleDateString('en-GB')
  };
}

/**
 * Generate detection indicators based on status
 */
function generateIndicators(status: string, text: string): Array<{title: string; description: string}> {
  const indicators = [];

  if (status === 'Fake') {
    if (text.includes('عاجل') || text.includes('خطير')) {
      indicators.push({
        title: 'Sensational Language',
        description: 'Heavy use of urgent and alarming terminology designed to provoke emotional response.'
      });
    }
    if (text.includes('مؤامرة') || text.includes('مجهولة')) {
      indicators.push({
        title: 'Conspiracy Indicators',
        description: 'References to unnamed conspiracies or unverified external threats.'
      });
    }
    indicators.push({
      title: 'Source Verification',
      description: 'No credible institutional sources cited. Typical pattern in misinformation.'
    });
  } else if (status === 'Real') {
    if (text.includes('وزارة') || text.includes('رسمي')) {
      indicators.push({
        title: 'Official Source',
        description: 'References to official government institutions and verified channels.'
      });
    }
    indicators.push({
      title: 'Factual Tone',
      description: 'Balanced language with specific details and verifiable information.'
    });
    indicators.push({
      title: 'Standard Terminology',
      description: 'Uses conventional news reporting style with proper attribution.'
    });
  } else if (status === 'Satire') {
    indicators.push({
      title: 'Satirical Exaggeration',
      description: 'Contains absurd or exaggerated claims intended for humorous effect.'
    });
    indicators.push({
      title: 'Ironic Context',
      description: 'Linguistic patterns suggest parody or social commentary rather than factual reporting.'
    });
  }

  return indicators;
}

/**
 * Analyze linguistic patterns in text
 */
function analyzeLinguisticPatterns(text: string): {
  emotionLevel: string;
  sourceCitations: number;
  factualClaims: number;
} {
  // Emotion detection
  const emotionalWords = ['عاجل', 'خطير', 'مفاجأة', 'صادم', '!'];
  const emotionCount = emotionalWords.filter(w => text.includes(w)).length;
  const emotionLevel = emotionCount >= 3 ? 'High' : emotionCount >= 1 ? 'Medium' : 'Low';

  // Source citations (looking for quotes, attributions, etc.)
  const citationPatterns = ['وزارة', 'قال', 'صرح', 'أعلن', 'حسب'];
  const sourceCitations = citationPatterns.filter(p => text.includes(p)).length;

  // Factual claims (numbers, dates, specific details)
  const numberMatches = text.match(/\d+/g) || [];
  const factualClaims = numberMatches.length + (text.includes('ابتداء') ? 1 : 0);

  return {
    emotionLevel,
    sourceCitations,
    factualClaims
  };
}

/**
 * Save analysis to browser history
 */
export function saveToHistory(result: AnalysisResult): void {
  try {
    const history = loadHistory();
    const historyItem: HistoryItem = {
      ...result,
      timestamp: Date.now()
    };
    history.unshift(historyItem);
    
    // Keep only last 50 items
    const trimmed = history.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

/**
 * Load history from browser storage
 */
export function loadHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Delete item from history
 */
export function deleteFromHistory(id: string): void {
  try {
    const history = loadHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete from history:', error);
  }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}