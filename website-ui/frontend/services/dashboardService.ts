// src/services/dashboardService.ts
// Service for fetching dashboard data from Supabase

import { supabase, PlatformStats, ClassPerformance, WeeklyTrend, DatasetDistribution } from './supabase';

export const dashboardService = {
  /**
   * Get platform overview statistics
   */
  async getPlatformStats(): Promise<PlatformStats | null> {
    try {
      const { data, error } = await supabase
        .from('platform_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching platform stats:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('getPlatformStats error:', error);
      return null;
    }
  },

  /**
   * Get class performance metrics
   */
  async getClassPerformance(): Promise<ClassPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('class_performance')
        .select('*')
        .order('samples', { ascending: false });
      
      if (error) {
        console.error('Error fetching class performance:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('getClassPerformance error:', error);
      return [];
    }
  },

  /**
   * Get weekly detection trends
   */
  async getWeeklyTrends(limit: number = 12): Promise<WeeklyTrend[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_trends')
        .select('*')
        .order('week_date', { ascending: true })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching weekly trends:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('getWeeklyTrends error:', error);
      return [];
    }
  },

  /**
   * Get dataset distribution
   */
  async getDatasetDistribution(): Promise<DatasetDistribution[]> {
    try {
      const { data, error } = await supabase
        .from('dataset_distribution')
        .select('*')
        .order('count', { ascending: false });
      
      if (error) {
        console.error('Error fetching dataset distribution:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('getDatasetDistribution error:', error);
      return [];
    }
  },

  /**
   * Get all dashboard data at once
   */
  async getAllDashboardData() {
    try {
      const [platformStats, classPerformance, weeklyTrends, datasetDistribution] = await Promise.all([
        this.getPlatformStats(),
        this.getClassPerformance(),
        this.getWeeklyTrends(),
        this.getDatasetDistribution()
      ]);

      return {
        platformStats,
        classPerformance,
        weeklyTrends,
        datasetDistribution
      };
    } catch (error) {
      console.error('getAllDashboardData error:', error);
      throw error;
    }
  },

  /**
   * Update platform stats (useful for incrementing counts after detections)
   */
  async updatePlatformStats(updates: Partial<PlatformStats>): Promise<void> {
    try {
      // Get the latest stats
      const currentStats = await this.getPlatformStats();
      
      if (!currentStats) {
        console.error('No platform stats found to update');
        return;
      }

      // Update with new values
      const { error } = await supabase
        .from('platform_stats')
        .update(updates)
        .eq('id', currentStats.id);
      
      if (error) {
        console.error('Error updating platform stats:', error);
        throw error;
      }
    } catch (error) {
      console.error('updatePlatformStats error:', error);
    }
  },

  /**
   * Increment API call count
   */
  async incrementApiCalls(): Promise<void> {
    try {
      const currentStats = await this.getPlatformStats();
      
      if (!currentStats) return;

      await this.updatePlatformStats({
        api_calls: currentStats.api_calls + 1
      });
    } catch (error) {
      console.error('incrementApiCalls error:', error);
    }
  }
};