import React, { useContext } from 'react';
import { BookOpen, AlertCircle, Layers, Cpu, Database, Target, TrendingUp } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card } from '../components/common';

export const About = () => {
  const { t, lang } = useContext(LanguageContext);
  
  // Real dataset statistics
  const datasetStats = {
    totalSamples: 7329,
    trainSamples: 5964,
    testSamples: 1193,
    vocabularySize: 54430,
    avgWordCount: 36.65,
    sources: 9,
    categories: 9
  };

  // Real model performance metrics
  const modelMetrics = {
    overallAccuracy: 86.59,
    weightedPrecision: 87.48,
    weightedRecall: 86.59,
    weightedF1Score: 86.91,
    totalParameters: 124, // 124M parameters
    trainableParameters: 7 // ~7M trainable params (final layers)
  };

  // Class distribution in the dataset
  const classDistribution = [
    { label: 'Not Fake', count: 4353, percentage: 73.0 },
    { label: 'Fake', count: 800, percentage: 13.4 },
    { label: 'Satire', count: 134, percentage: 2.2 },
    { label: 'Not News', count: 677, percentage: 11.4 }
  ];

  // Per-class performance
  const classPerformance = [
    { class: 'Not Fake', precision: 95.44, recall: 91.27, f1: 93.31, support: 871 },
    { class: 'Fake', precision: 67.58, recall: 76.88, f1: 71.93, support: 160 },
    { class: 'Satire', precision: 59.09, recall: 48.15, f1: 53.06, support: 27 },
    { class: 'Not News', precision: 65.38, recall: 75.56, f1: 70.10, support: 135 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900">{t.about}</h1>
        <p className="text-xl text-gray-500">Academic Project - ENSIA Algiers</p>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {lang === 'ar' 
            ? 'أول نظام أكاديمي متخصص في كشف الأخبار المزيفة باللهجة الجزائرية باستخدام الذكاء الاصطناعي'
            : 'First academic system specialized in detecting fake news in Algerian dialect using AI'}
        </p>
      </div>

      {/* Methodology */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Layers className="text-blue-600" /> {t.methodology}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title={lang === 'ar' ? 'البيانات' : 'Data'} className="border-t-4 border-t-blue-500">
            <p className="text-sm text-gray-500 leading-relaxed">
              {lang === 'ar'
                ? '7,329 نص تم جمعه من 9 مصادر مختلفة بما في ذلك واتساب وفيسبوك وتويتر والمواقع الإخبارية الجزائرية، موزعة على 9 فئات موضوعية.'
                : '7,329 texts collected from 9 different sources including WhatsApp, Facebook, Twitter and Algerian news websites, distributed across 9 thematic categories.'}
            </p>
          </Card>
          
          <Card title={lang === 'ar' ? 'النموذج' : 'Model'} className="border-t-4 border-t-blue-500">
            <p className="text-sm text-gray-500 leading-relaxed">
              {lang === 'ar'
                ? 'نموذج DziriBERT المحول المدرب مسبقًا بـ 124 مليون معامل، متخصص في اللهجة المغاربية والدارجة الجزائرية.'
                : 'Fine-tuned DziriBERT transformer with 124M parameters, specialized for Maghrebian Arabic and Algerian Darja nuances.'}
            </p>
          </Card>
          
          <Card title={lang === 'ar' ? 'الشفافية' : 'Explainability'} className="border-t-4 border-t-blue-500">
            <p className="text-sm text-gray-500 leading-relaxed">
              {lang === 'ar'
                ? 'مؤشرات لغوية وطبقات تفسيرية توفر الشفافية لجميع قرارات النموذج مع تحليل الأنماط العاطفية والمصادر.'
                : 'Linguistic markers and explainability layers provide transparency for all model decisions with emotional pattern and source analysis.'}
            </p>
          </Card>
        </div>
      </section>

      {/* Limitations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <AlertCircle className="text-orange-500" /> {t.limitations}
        </h2>
        <Card className="bg-orange-50 text-sm text-orange-800 p-6 border-orange-100">
          <p className="font-bold mb-2">
            {lang === 'ar' ? 'تنبيه:' : 'Notice:'}
          </p>
          <p className="leading-relaxed">
            {lang === 'ar'
              ? 'هذا نموذج بحثي أولي. الدقة حوالي 86.6٪. يحلل النظام النص فقط. محسّن خصيصًا للدارجة الجزائرية وقد لا يعمم بشكل جيد على العربية الفصحى أو اللهجات الإقليمية الأخرى.'
              : 'This is a research prototype. Accuracy is approximately 86.6%. The system analyzes text only. Optimized specifically for Algerian Darja and may not generalize well to MSA or other regional dialects.'}
          </p>
        </Card>
      </section>

      {/* Citation */}
      <section className="p-8 bg-gray-900 rounded-2xl text-white space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <BookOpen className="text-blue-400" /> {t.citeWork}
        </h2>
        <div className="p-4 bg-white/10 rounded-xl font-mono text-xs select-all border border-white/10 leading-relaxed">
          ENSIA Team. (2025). News Police: A Framework for Fake News Detection in Algerian Dialect Media. National Higher School of Artificial Intelligence (ENSIA), Algiers, Algeria.
        </div>
      </section>
    </div>
  );
};