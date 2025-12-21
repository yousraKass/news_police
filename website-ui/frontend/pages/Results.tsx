
import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, FileText, Download, Share2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';
import { AnalysisResult } from '../types';

export const Results = () => {
  const { t, lang } = useContext(LanguageContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const result: AnalysisResult = state?.result;

  if (!result) return <div className="p-8 text-center">{t.processing}</div>;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: t.title, text: `${t.verdict}: ${result.status}`, url });
      } catch (e: any) { 
        if (e.name !== 'AbortError') {
          navigator.clipboard.writeText(url); alert(t.copied);
        }
      }
    } else {
      navigator.clipboard.writeText(url); alert(t.copied);
    }
  };

  const isPos = result.status === 'Real';
  const colorClass = isPos ? 'bg-green-600' : result.status === 'Fake' ? 'bg-red-600' : 'bg-orange-500';
  const textColorClass = isPos ? 'text-green-500' : result.status === 'Fake' ? 'text-red-500' : 'text-orange-500';

  return (
    <div className={`max-w-5xl mx-auto space-y-8 slide-up pb-20 ${lang === 'ar' ? 'rtl' : ''}`}>
      <div className={`p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 ${colorClass} text-white shadow-xl`}>
        <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30 shrink-0">
           {isPos ? <CheckCircle2 size={80} /> : result.status === 'Fake' ? <AlertTriangle size={80} /> : <FileText size={80} />}
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
           <div className="text-sm font-bold uppercase tracking-widest opacity-80">{t.verdict}</div>
           <h1 className="text-4xl font-black">{result.status === 'Real' ? t.real : result.status === 'Fake' ? t.fake : t.satire}</h1>
           <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <div className="bg-white/10 px-4 py-2 rounded-full font-bold">{t.confidence}: {result.confidence}%</div>
           </div>
        </div>
        <div className="flex flex-col gap-2 min-w-[160px] no-print">
           <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full" onClick={() => window.print()}><Download size={18} /> {t.downloadPdf}</Button>
           <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full" onClick={handleShare}><Share2 size={18} /> {t.shareReport}</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title={t.originalContent}><p className={`text-xl font-arabic arabic-line-height ${lang === 'ar' ? 'text-right' : ''}`} dir="rtl">{result.inputText}</p></Card>
          <Card title={t.rationale}>
            {result.indicators.map((ind, i) => (
              <div key={i} className="mb-4 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                <AlertCircle className={textColorClass} size={20} />
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                   <h4 className="font-bold text-gray-900">{ind.title}</h4>
                   <p className="text-sm text-gray-500">{ind.description}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div className="space-y-8">
          <Card title={t.classificationBreakdown}>
             <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={[{name:t.fake,v:result.probabilities.fake},{name:t.real,v:result.probabilities.real},{name:t.satire,v:result.probabilities.satire}]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="v">
                        <Cell fill="#ef4444" /><Cell fill="#22c55e" /><Cell fill="#f97316" />
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between text-gray-700"><span>{t.fake}</span><span className="font-bold">{(result.probabilities.fake*100).toFixed(0)}%</span></div>
                <div className="flex justify-between text-gray-700"><span>{t.real}</span><span className="font-bold">{(result.probabilities.real*100).toFixed(0)}%</span></div>
                <div className="flex justify-between text-gray-700"><span>{t.satire}</span><span className="font-bold">{(result.probabilities.satire*100).toFixed(0)}%</span></div>
             </div>
          </Card>
          <Card title={t.linguisticProfile}>
             <div className="space-y-4">
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span className="text-gray-500 font-medium">Dialect</span>
                 <span className="font-bold text-gray-900">Darja (Algerian)</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span className="text-gray-500 font-medium">Emotional Level</span>
                 <span className={`font-bold ${result.linguisticPatterns.emotionLevel === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                   {result.linguisticPatterns.emotionLevel}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm border-b pb-2">
                 <span className="text-gray-500 font-medium">Cited Sources</span>
                 <span className="font-bold text-gray-900">{result.linguisticPatterns.sourceCitations}</span>
               </div>
               {/* Fix: Added Factual Claims to the linguistic profile display */}
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500 font-medium">Factual Claims</span>
                 <span className="font-bold text-gray-900">{result.linguisticPatterns.factualClaims}</span>
               </div>
             </div>
          </Card>
        </div>
      </div>
      <div className="flex justify-center gap-4 no-print">
         <Button onClick={() => navigate('/detect')}>{t.newAnalysis}</Button>
         <Button variant="secondary" onClick={() => navigate('/history')}>{t.history}</Button>
      </div>
    </div>
  );
};
