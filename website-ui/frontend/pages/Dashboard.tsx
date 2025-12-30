import React, { useContext } from 'react';
import { FileText, AlertTriangle, Activity, Users, TrendingUp, Download, Database, Layers, Target, Award } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';

export const Dashboard = () => {
  const { t, lang } = useContext(LanguageContext);
  
  // Real model performance metrics from your DziriBERT classifier
  const modelMetrics = {
    overallAccuracy: 86.59, // Overall accuracy from classification report
    weightedPrecision: 87.48, // Weighted avg precision
    weightedRecall: 86.59, // Same as accuracy (weighted avg recall)
    weightedF1Score: 86.91, // Weighted avg F1-score
    totalParameters: 124, // 124M parameters (DziriBERT)
    trainableParameters: 7, // ~7M trainable params (final layers)
  };

  // Real dataset statistics
  const datasetStats = {
    totalSamples: 7329,
    trainSamples: 5964, // ~80% of 7329 (after processing: 5964 total)
    testSamples: 1193, // Test set size from your results
    vocabularySize: 54430,
    avgWordCount: 36.65,
    sources: 9,
    categories: 9,
  };

  // Class distribution after processing (from your data)
  const classDistribution = [
    { name: lang === 'ar' ? 'أخبار حقيقية' : 'Real News', value: 4353, percentage: 73.0, color: '#22c55e' },
    { name: lang === 'ar' ? 'أخبار مزيفة' : 'Fake News', value: 800, percentage: 13.4, color: '#ef4444' },
    { name: lang === 'ar' ? 'ساخر' : 'Satire', value: 134, percentage: 2.2, color: '#f97316' },
    { name: lang === 'ar' ? 'ليس أخبار' : 'Not News', value: 677, percentage: 11.4, color: '#8b5cf6' },
  ];

  // Per-class performance from classification report
  const classPerformance = [
    { 
      class: lang === 'ar' ? 'حقيقية' : 'Real', 
      precision: 95.44, 
      recall: 91.27, 
      f1: 93.31, 
      support: 871,
      color: '#22c55e'
    },
    { 
      class: lang === 'ar' ? 'مزيفة' : 'Fake', 
      precision: 67.58, 
      recall: 76.88, 
      f1: 71.93, 
      support: 160,
      color: '#ef4444'
    },
    { 
      class: lang === 'ar' ? 'ساخر' : 'Satire', 
      precision: 59.09, 
      recall: 48.15, 
      f1: 53.06, 
      support: 27,
      color: '#f97316'
    },
    { 
      class: lang === 'ar' ? 'ليس أخبار' : 'Not News', 
      precision: 65.38, 
      recall: 75.56, 
      f1: 70.10, 
      support: 135,
      color: '#8b5cf6'
    },
  ];

  // Detection trends over time (mock weekly data but realistic proportions)
  const detectionTrends = [
    { week: 'W1', fake: 12, real: 52, satire: 2, notNews: 8 },
    { week: 'W2', fake: 15, real: 58, satire: 3, notNews: 10 },
    { week: 'W3', fake: 10, real: 55, satire: 1, notNews: 9 },
    { week: 'W4', fake: 18, real: 60, satire: 4, notNews: 11 },
    { week: 'W5', fake: 14, real: 54, satire: 2, notNews: 8 },
    { week: 'W6', fake: 20, real: 62, satire: 3, notNews: 12 },
    { week: 'W7', fake: 16, real: 57, satire: 2, notNews: 10 },
  ];

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
      label: lang === 'ar' ? 'حجم المفردات' : 'Vocabulary Size', 
      value: datasetStats.vocabularySize.toLocaleString(), 
      icon: FileText, 
      color: 'orange',
      subtitle: `${datasetStats.avgWordCount} ${lang === 'ar' ? 'كلمة/نص' : 'words/text avg'}`
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
            {classPerformance.map((cls, idx) => (
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
                    <div className="font-bold" style={{ color: cls.color }}>{cls.precision}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{lang === 'ar' ? 'استدعاء' : 'Recall'}</div>
                    <div className="font-bold" style={{ color: cls.color }}>{cls.recall}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">F1</div>
                    <div className="font-bold" style={{ color: cls.color }}>{cls.f1}%</div>
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
                data={classDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {classDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {classDistribution.map((cls, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: cls.color }} />
                <span className="text-gray-600">{cls.value.toLocaleString()} samples</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detection Trends Chart */}
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