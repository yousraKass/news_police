import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, FileText, Download, Share2, AlertCircle, Beaker } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';
import { AnalysisResult } from '../types';

export const Results = () => {
  const { t, lang } = useContext(LanguageContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const result: AnalysisResult = state?.result;

  if (!result) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">{t.processing}</p>
        <Button onClick={() => navigate('/detect')} className="mt-4">
          {t.newAnalysis}
        </Button>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: t.title, 
          text: `${t.verdict}: ${result.status}`, 
          url 
        });
      } catch (e: any) { 
        if (e.name !== 'AbortError') {
          navigator.clipboard.writeText(url); 
          alert(t.copied);
        }
      }
    } else {
      navigator.clipboard.writeText(url); 
      alert(t.copied);
    }
  };

  const isSimulation = result.metadata?.mode === 'simulation';
  const isPos = result.status === 'Real';
  const colorClass = isPos 
    ? 'bg-green-600' 
    : result.status === 'Fake' 
    ? 'bg-red-600' 
    : result.status === 'Satire'
    ? 'bg-orange-500'
    : 'bg-purple-600';
  const textColorClass = isPos 
    ? 'text-green-500' 
    : result.status === 'Fake' 
    ? 'text-red-500' 
    : result.status === 'Satire'
    ? 'text-orange-500'
    : 'text-purple-500';

  return (
    <div className={`max-w-5xl mx-auto space-y-8 slide-up pb-20 ${lang === 'ar' ? 'rtl' : ''}`}>
      {/* Simulation Mode Banner */}

      {/* Verdict Header */}
      <div className={`p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 ${colorClass} text-white shadow-xl`}>
        <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30 shrink-0">
           {isPos 
             ? <CheckCircle2 size={80} /> 
             : result.status === 'Fake' 
             ? <AlertTriangle size={80} /> 
             : <FileText size={80} />}
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
           <div className="text-sm font-bold uppercase tracking-widest opacity-80">{t.verdict}</div>
           <h1 className="text-4xl font-black">
             {result.status === 'Real' 
               ? t.real 
               : result.status === 'Fake' 
               ? t.fake 
               : result.status === 'Satire'
               ? t.satire
               : 'Not News'}
           </h1>
           <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <div className="bg-white/10 px-4 py-2 rounded-full font-bold">
                {t.confidence}: {result.confidence}%
              </div>
              {isSimulation && (
                <div className="bg-white/10 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  <Beaker size={16} />
                  {lang === 'ar' ? 'محاكاة' : 'Simulation'}
                </div>
              )}
           </div>
        </div>
        <div className="flex flex-col gap-2 min-w-[160px] no-print">
           <Button 
             variant="secondary" 
             className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full" 
             onClick={() => window.print()}
           >
             <Download size={18} /> {t.downloadPdf}
           </Button>
           <Button 
             variant="secondary" 
             className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full" 
             onClick={handleShare}
           >
             <Share2 size={18} /> {t.shareReport}
           </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Original Content */}
          <Card title={t.originalContent}>
            <p className={`text-xl font-arabic arabic-line-height ${lang === 'ar' ? 'text-right' : ''}`} dir="rtl">
              {result.inputText}
            </p>
            {/* Metadata */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{lang === 'ar' ? 'المصدر:' : 'Source:'}</span>
                <span className="ml-2 font-medium text-gray-900">{result.metadata.source}</span>
              </div>
              <div>
                <span className="text-gray-500">{lang === 'ar' ? 'الفئة:' : 'Category:'}</span>
                <span className="ml-2 font-medium text-gray-900">{result.metadata.category}</span>
              </div>
            </div>
          </Card>

          {/* Detection Rationale */}
          <Card title={t.rationale}>
            {result.indicators && result.indicators.length > 0 ? (
              result.indicators.map((ind, i) => (
                <div key={i} className="mb-4 last:mb-0 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className={textColorClass} size={20} />
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                     <h4 className="font-bold text-gray-900">{ind.title}</h4>
                     <p className="text-sm text-gray-500 mt-1">{ind.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">
                {lang === 'ar' 
                  ? 'لا توجد مؤشرات محددة متاحة لهذا التحليل.'
                  : 'No specific indicators available for this analysis.'}
              </p>
            )}
          </Card>
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-8">
          {/* Classification Breakdown */}
          <Card title={t.classificationBreakdown}>
             <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie 
                        data={[
                          {name: t.fake, v: result.probabilities.fake * 100},
                          {name: t.real, v: result.probabilities.real * 100},
                          {name: t.satire, v: result.probabilities.satire * 100},
                          {name: lang === 'ar' ? 'ليس خبر' : 'Not News', v: (result.probabilities.not_news || 0) * 100}
                        ]} 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="v"
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#f97316" />
                        <Cell fill="#9333ea" />
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>{t.fake}</span>
                  <span className="font-bold">{(result.probabilities.fake * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t.real}</span>
                  <span className="font-bold">{(result.probabilities.real * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t.satire}</span>
                  <span className="font-bold">{(result.probabilities.satire * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{lang === 'ar' ? 'ليس خبر' : 'Not News'}</span>
                  <span className="font-bold">{((result.probabilities.not_news || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-gray-700 pt-2 mt-2 border-t border-gray-200">
                  <span className="font-semibold">{lang === 'ar' ? 'المجموع' : 'Total'}</span>
                  <span className="font-bold text-blue-600">
                    {((result.probabilities.fake + result.probabilities.real + result.probabilities.satire + (result.probabilities.not_news || 0)) * 100).toFixed(1)}%
                  </span>
                </div>
             </div>
          </Card>

          {/* Linguistic Profile */}
          <Card title={t.linguisticProfile}>
             <div className="space-y-4">
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span className="text-gray-500 font-medium">
                   {lang === 'ar' ? 'اللهجة' : 'Dialect'}
                 </span>
                 <span className="font-bold text-gray-900">
                   {lang === 'ar' ? 'الدارجة الجزائرية' : 'Algerian Darja'}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span className="text-gray-500 font-medium">
                   {lang === 'ar' ? 'المستوى العاطفي' : 'Emotional Level'}
                 </span>
                 <span className={`font-bold ${
                   result.linguisticPatterns.emotionLevel === 'High' 
                     ? 'text-red-500' 
                     : result.linguisticPatterns.emotionLevel === 'Medium'
                     ? 'text-orange-500'
                     : 'text-green-500'
                 }`}>
                   {result.linguisticPatterns.emotionLevel}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span className="text-gray-500 font-medium">
                   {lang === 'ar' ? 'المصادر المذكورة' : 'Cited Sources'}
                 </span>
                 <span className="font-bold text-gray-900">
                   {result.metadata?.documents?.length || result.linguisticPatterns.sourceCitations || 0}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500 font-medium">
                   {lang === 'ar' ? 'الادعاءات الواقعية' : 'Factual Claims'}
                 </span>
                 <span className="font-bold text-gray-900">
                   {result.linguisticPatterns.factualClaims}
                 </span>
               </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Retrieved Documents Section */}
      {result.metadata?.documents && result.metadata.documents.length > 0 && (
        <Card title={lang === 'ar' ? 'المستندات المسترجعة' : 'Retrieved Documents'}>
          <div className="space-y-4">
            {result.metadata.documents.map((doc: any, idx: number) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      {lang === 'ar' ? 'مستند' : 'Document'} {idx + 1}
                    </div>
                    <p className={`text-sm text-gray-600 line-clamp-3 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                      {doc.content?.substring(0, 200)}...
                    </p>
                  </div>
                  {doc.metadata?.source && (
                    <a
                      href={doc.metadata.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {lang === 'ar' ? 'المصدر' : 'Source'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 no-print">
         <Button onClick={() => navigate('/detect')}>
           {t.newAnalysis}
         </Button>
      </div>
    </div>
  );
};