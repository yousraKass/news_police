// src/services/api.ts
// API service for News Police backend

const API_BASE_URL = 'http://localhost:5000';

export interface PredictionResponse {
  predicted_class: 'Not_fake' | 'fake' | 'satire' | 'not_news';
  predicted_label: number;
  confidence: number;
  all_probabilities: {
    Not_fake: number;
    fake: number;
    satire: number;
    not_news: number;
  };
  timestamp: string;
  text_length: number;
  mode?: 'mock' | 'real';
}

class NewsAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Predict the classification of a news text
   */
  async predict(text: string): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Prediction failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  /**
   * Check if the backend API is online
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/`);
      const data = await response.json();
      return data.status === 'online';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/model-info`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch model info');
      }

      return await response.json();
    } catch (error) {
      console.error('Model info error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const newsAPI = new NewsAPI();