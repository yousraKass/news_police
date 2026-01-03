// src/services/supabase.ts
// Supabase client configuration

import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings -> API
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ewnstuybwqlscygkaqxw.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bnN0dXlid3Fsc2N5Z2thcXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDk3MTEsImV4cCI6MjA4MDU4NTcxMX0.Fe27DvDEIpXx0UnEYQMTfSAJ6zavePTazfxClclUcbA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface PlatformStats {
  id: number;
  created_at: string;
  total_users: number;
  accuracy_rate: number;
  total_samples: number;
  api_calls: number;
}

export interface ClassPerformance {
  id: number;
  created_at: string;
  class_name: string;
  samples: number;
  accuracy: number;
  precision_score?: number;
  recall_score?: number;
  f1_score?: number;
}

export interface WeeklyTrend {
  id: number;
  week_date: string;
  real_count: number;
  fake_count: number;
  satire_count: number;
  not_news_count: number;
  created_at: string;
}

export interface DatasetDistribution {
  id: number;
  created_at: string;
  category: string;
  count: number;
  percentage: number;
}