import React, { useContext, useState, useEffect } from 'react';
import { FileText, AlertTriangle, Activity, Users, TrendingUp, Download, Database, Layers, Target, Award } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';
import { dashboardService } from '../services/dashboardService';

export const Dashboard = () => {
  const { t, lang } = useContext(LanguageContext);
  
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [classPerformance, setClassPerformance] = useState<any[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [datasetDistribution, setDatasetDistribution] = useState<any[]>([]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const data = await dashboardService.getAllDashboardData();
        
        setPlatformStats(data.platformStats);
        setClassPerformance(data.classPerformance);
        setWeeklyTrends(data.weeklyTrends);
        setDatasetDistribution(data.datasetDistribution);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-red-600 mb-2">{lang === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  // Real model performance metrics
  const modelMetrics = {
    overallAccuracy: platformStats?.accuracy_rate || 86.59,
    weightedPrecision: 87.48,
    weightedRecall: 86.59,
    weightedF1Score: 86.91,
    totalParameters: 124,
    trainableParameters: 7,
  };

  // Real dataset statistics
  const datasetStats = {
    totalSamples: platformStats?.total_samples || 7329,
    trainSamples: 5964,
    testSamples: 1193,
    vocabularySize: 54430,
    avgWordCount: 36.65,
    sources: 9,
    categories: 9,
  };

  // Format class distribution for pie chart
  const classDistributionChart = datasetDistribution.map((item) => ({
    name: lang === 'ar' 
      ? item.category === 'Real News' ? 'أخبار حقيقية'
      : item.category === 'Fake News' ? 'أخبار مزيفة'
      : item.category === 'Satire' ? 'ساخر'
      : 'ليس أخبار'
      : item.category,
    value: item.count,
    percentage: item.percentage,
    color: item.category === 'Real News' ? '#22c55e'
      : item.category === 'Fake News' ? '#ef4444'
      : item.category === 'Satire' ? '#f97316'
      : '#8b5cf6'
  }));

  // Format class performance data
  const classPerformanceData = classPerformance.map((cls) => ({
    class: lang === 'ar' 
      ? cls.class_name === 'Real' ? 'حقيقية'
      : cls.class_name === 'Fake' ? 'مزيفة'
      : cls.class_name === 'Satire' ? 'ساخر'
      : 'ليس أخبار'
      : cls.class_name,
    precision: cls.precision_score || cls.accuracy || 0,
    recall: cls.recall_score || cls.accuracy || 0,
    f1: cls.f1_score || cls.accuracy || 0,
    support: cls.samples,
    color: cls.class_name === 'Real' ? '#22c55e'
      : cls.class_name === 'Fake' ? '#ef4444'
      : cls.class_name === 'Satire' ? '#f97316'
      : '#8b5cf6'
  }));

  // Format weekly trends for area chart
  const detectionTrends = weeklyTrends.map((week, idx) => ({
    week: `W${idx + 1}`,
    fake: week.fake_count,
    real: week.real_count,
    satire: week.satire_count,
    notNews: week.not_news_count
  }));

  // Main dashboard statistics cards
  const stats = [
    { 
      label: lang === 'ar' ? 'عينات التدريب' : 'Training Samples', 
      value: datasetStats.trainSamples.toLocaleString(), 
      icon: Database, 
      color: 'blue',
      subtitle: `${datasetStats.testSamples} ${lang === 'ar' ? 'للاختبار' : 'test samples'}`
    },
    { 
      label: lang === 'ar' ? 'دقة النموذج' : 'Model Accuracy', 
      value: `${modelMetrics.overallAccuracy}%`, 
      icon: Target, 
      color: 'green',
      subtitle: `${modelMetrics.weightedF1Score}% ${lang === 'ar' ? 'نقاط F1' : 'F1-score'}`
    },
    { 
      label: lang === 'ar' ? 'معاملات النموذج' : 'Model Parameters', 
      value: `${modelMetrics.totalParameters}M`, 
      icon: Layers, 
      color: 'purple',
      subtitle: `${modelMetrics.trainableParameters}M ${lang === 'ar' ? 'قابلة للتدريب' : 'trainable'}`
    },
    { 
      label: lang === 'ar' ? 'طلبات API' : 'API Calls', 
      value: (platformStats?.api_calls || 0).toLocaleString(), 
      icon: Activity, 
      color: 'orange',
      subtitle: `${(platformStats?.total_users || 0).toLocaleString()} ${lang === 'ar' ? 'مستخدم' : 'users'}`
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'ar' ? 'نظرة عامة على المنصة' : 'Platform Overview'}
          </h1>
          <p className="text-gray-500">
            {lang === 'ar' ? 'مقاييس نموذج DziriBERT الحقيقية' : 'Real DziriBERT Model Metrics'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Download size={16} /> {lang === 'ar' ? 'تصدير التقرير' : 'Export Report'}
        </Button>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.subtitle}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Model Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Class Performance */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {lang === 'ar' ? 'أداء كل فئة' : 'Per-Class Performance'}
          </h3>
          <div className="space-y-4">
            {classPerformanceData.map((cls, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{cls.class}</span>
                  <span className="text-xs text-gray-500">
                    {cls.support} {lang === 'ar' ? 'عينة' : 'samples'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">{lang === 'ar' ? 'دقة' : 'Precision'}</div>
                    <div className="font-bold" style={{ color: cls.color }}>{cls.precision.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{lang === 'ar' ? 'استدعاء' : 'Recall'}</div>
                    <div className="font-bold" style={{ color: cls.color }}>{cls.recall.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">F1</div>
                    <div className="font-bold" style={{ color: cls.color }}>{cls.f1.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300" 
                    style={{ width: `${cls.f1}%`, backgroundColor: cls.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dataset Class Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {lang === 'ar' ? 'توزيع مجموعة البيانات' : 'Dataset Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={classDistributionChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {classDistributionChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {classDistributionChart.map((cls, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: cls.color }} />
                <span className="text-gray-600">{cls.value.toLocaleString()} samples</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detection Trends Chart */}
      {detectionTrends.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {lang === 'ar' ? 'اتجاهات الكشف الأسبوعية' : 'Weekly Detection Trends'}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={detectionTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="fake" 
                name={lang === 'ar' ? 'مزيف' : 'Fake'} 
                stackId="1"
                stroke="#ef4444" 
                fill="#fee2e2" 
              />
              <Area 
                type="monotone" 
                dataKey="real" 
                name={lang === 'ar' ? 'حقيقي' : 'Real'} 
                stackId="1"
                stroke="#22c55e" 
                fill="#dcfce7" 
              />
              <Area 
                type="monotone" 
                dataKey="satire" 
                name={lang === 'ar' ? 'ساخر' : 'Satire'} 
                stackId="1"
                stroke="#f97316" 
                fill="#ffedd5" 
              />
              <Area 
                type="monotone" 
                dataKey="notNews" 
                name={lang === 'ar' ? 'ليس أخبار' : 'Not News'} 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#ede9fe" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Model Architecture Info */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {lang === 'ar' ? 'معلومات نموذج DziriBERT' : 'DziriBERT Model Information'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-500">{lang === 'ar' ? 'بنية النموذج' : 'Model Architecture'}</div>
            <div className="font-bold text-gray-900">DziriBERT</div>
            <div className="text-xs text-gray-500">{lang === 'ar' ? 'محول معتمد على BERT' : 'BERT-based Transformer'}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">{lang === 'ar' ? 'إجمالي المعاملات' : 'Total Parameters'}</div>
            <div className="font-bold text-gray-900">{modelMetrics.totalParameters}M</div>
            <div className="text-xs text-gray-500">{modelMetrics.trainableParameters}M {lang === 'ar' ? 'قابلة للتدريب' : 'trainable'}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">{lang === 'ar' ? 'التدريب' : 'Training Strategy'}</div>
            <div className="font-bold text-gray-900">{lang === 'ar' ? 'ضبط دقيق' : 'Fine-tuning'}</div>
            <div className="text-xs text-gray-500">{lang === 'ar' ? 'الطبقات الأخيرة فقط' : 'Final layers only'}</div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Award className="text-blue-600 mt-1" size={20} />
            <div>
              <div className="font-medium text-blue-900">
                {lang === 'ar' ? 'استراتيجية التحسين' : 'Optimization Strategy'}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {lang === 'ar' 
                  ? 'أوزان متوازنة للفئات + زيادة أخذ العينات للفئات الأقلية لمعالجة عدم التوازن في البيانات'
                  : 'Class-balanced weights + minority oversampling to handle data imbalance'
                }
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dataset Statistics */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {lang === 'ar' ? 'إحصائيات مجموعة البيانات' : 'Dataset Statistics'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{datasetStats.totalSamples.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{lang === 'ar' ? 'إجمالي العينات' : 'Total Samples'}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{datasetStats.sources}</div>
            <div className="text-sm text-gray-500">{lang === 'ar' ? 'المصادر' : 'Sources'}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{datasetStats.categories}</div>
            <div className="text-sm text-gray-500">{lang === 'ar' ? 'الفئات' : 'Categories'}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{datasetStats.vocabularySize.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{lang === 'ar' ? 'حجم المفردات' : 'Vocabulary'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};