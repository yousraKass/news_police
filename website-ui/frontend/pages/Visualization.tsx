import React, { useContext } from 'react';
import { Download, Globe } from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, 
  Treemap, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer 
} from 'recharts';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';
import { PERFORMANCE_METRICS, SOURCE_DATA, CONFIDENCE_DISTRIBUTION } from '../data';

export const Visualization = () => {
  const { t } = useContext(LanguageContext);
  
  const mappedPerf = PERFORMANCE_METRICS.map(p => ({
    m: p.metric === 'Precision' ? t.precision : 
       p.metric === 'Recall' ? t.recall : 
       p.metric === 'F1-Score' ? t.f1 : 
       p.metric === 'Accuracy' ? t.acc : t.spec,
    v: p.value
  }));

  return (
    <div className="space-y-8 fade-in pb-20">
       <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">{t.analytics}</h1><p className="text-gray-500">Model performance & landscape insights</p></div>
          <Button variant="secondary" onClick={() => window.print()}><Download size={16} /> {t.exportReport}</Button>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title={t.performanceEval} className="h-[450px]">
             <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mappedPerf}>
                     <PolarGrid />
                     <PolarAngleAxis dataKey="m" tick={{fill: '#64748b', fontSize: 12}} />
                     <PolarRadiusAxis domain={[0, 1]} />
                     <Radar name="DziriBERT" dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                     <Legend />
                  </RadarChart>
               </ResponsiveContainer>
             </div>
          </Card>
          <Card title={t.sourcePrev} className="h-[450px]">
             <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <Treemap data={SOURCE_DATA} dataKey="value" stroke="#fff" fill="#3b82f6" />
               </ResponsiveContainer>
             </div>
          </Card>
          <Card title={t.confHist} className="h-[450px]">
             <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CONFIDENCE_DISTRIBUTION}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                     <XAxis dataKey="r" />
                     <YAxis />
                     <Tooltip />
                     <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </Card>
          <Card title={t.geoSpread}>
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
                <Globe size={64} className="text-blue-500 animate-spin-slow" />
                <div className="text-lg font-bold text-gray-900">Algeria Regional Activity</div>
                <div className="text-sm text-gray-500 max-w-xs mx-auto">Concentrated in Algiers (42%), Oran (18%), and Constantine (12%).</div>
                <div className="w-full flex gap-1 justify-center mt-4 px-10">
                   <div className="h-2 w-1/2 bg-blue-600 rounded"></div>
                   <div className="h-2 w-1/4 bg-blue-400 rounded"></div>
                   <div className="h-2 w-1/8 bg-blue-200 rounded"></div>
                </div>
             </div>
          </Card>
       </div>
    </div>
  );
};
