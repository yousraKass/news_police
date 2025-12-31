import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Cpu, Layers, Lock, Target } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';

export const Home = () => {
  const { t, lang } = useContext(LanguageContext);
  
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10 fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
          <Activity size={16} /> {t.tagline}
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {t.heroTitle}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          {t.heroDesc}
        </p>
        
        {/* Key Stats Banner */}
        <div className="flex items-center justify-center gap-8 pt-4 pb-2">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">86.6%</div>
            <div className="text-sm text-gray-500">
              {lang === 'ar' ? 'دقة' : 'Accuracy'}
            </div>
          </div>
          <div className="h-12 w-px bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">7,329</div>
            <div className="text-sm text-gray-500">
              {lang === 'ar' ? 'عينة' : 'Samples'}
            </div>
          </div>
          <div className="h-12 w-px bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">124M</div>
            <div className="text-sm text-gray-500">
              {lang === 'ar' ? 'معاملات' : 'Parameters'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link to="/detect" className="no-underline">
            <Button as="span" className="px-8 py-3 text-lg cursor-pointer">
              {t.startAnalysis} <ArrowRight size={20} />
            </Button>
          </Link>
          <Link to="/about" className="no-underline">
            <Button as="span" variant="secondary" className="px-8 py-3 text-lg cursor-pointer">
              {t.methodology}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            icon: Cpu, 
            title: lang === 'ar' ? 'محرك DziriBERT' : 'DziriBERT Engine',
            desc: lang === 'ar' 
              ? 'نموذج محول مدرب مسبقًا بـ 124 مليون معامل، محسّن خصيصًا للدارجة الجزائرية.'
              : 'Pre-trained transformer with 124M parameters, optimized specifically for Algerian Darja.',
            stats: '124M params'
          },
          { 
            icon: Target, 
            title: lang === 'ar' ? 'كشف 4 فئات' : '4-Class Detection',
            desc: lang === 'ar'
              ? 'تصنيف إلى أخبار حقيقية، مزيفة، ساخرة، وغير أخبار بدقة 86.6٪.'
              : 'Classification into Real, Fake, Satire, and Not News with 86.6% accuracy.',
            stats: '86.6% accuracy'
          },
          { 
            icon: Lock, 
            title: lang === 'ar' ? 'ذكاء اصطناعي شفاف' : 'Explainable AI',
            desc: lang === 'ar'
              ? 'تحليل المؤشرات اللغوية والأنماط العاطفية والمصادر المذكورة لكل قرار.'
              : 'Linguistic markers, emotional patterns, and source analysis for every decision.',
            stats: 'Full transparency'
          }
        ].map((feat, i) => (
          <Card key={i} className="text-center space-y-4 hover:shadow-lg transition-shadow">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <feat.icon size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feat.title}</h3>
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 mb-3">
                {feat.stats}
              </div>
            </div>
            <p className="text-gray-500 leading-relaxed text-sm">
              {feat.desc}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};