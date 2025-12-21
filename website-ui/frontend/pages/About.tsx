import React, { useContext } from 'react';
import { BookOpen, AlertCircle, Layers, Cpu, Globe } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card } from '../components/common';

export const About = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 fade-in">
       <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900">{t.about}</h1>
          <p className="text-xl text-gray-500">Academic Project - ENSIA Algiers</p>
       </div>
       <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3"><Layers className="text-blue-600" /> {t.methodology}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card title="Data" className="border-t-4 border-t-blue-500"><p className="text-sm text-gray-500 leading-relaxed">5,000+ texts collected from Algerian WhatsApp, Facebook, and Twitter channels.</p></Card>
             <Card title="Model" className="border-t-4 border-t-blue-500"><p className="text-sm text-gray-500 leading-relaxed">Fine-tuned DziriBERT transformer specialized for colloquial Maghrebian Arabic nuances.</p></Card>
             <Card title="Explain" className="border-t-4 border-t-blue-500"><p className="text-sm text-gray-500 leading-relaxed">Linguistic markers and explainability layers provide transparency for all model decisions.</p></Card>
          </div>
       </section>
       <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3"><AlertCircle className="text-orange-500" /> {t.limitations}</h2>
          <Card className="bg-orange-50 text-sm text-orange-800 p-6 border-orange-100">
            <p className="font-bold mb-2">Notice:</p>
            <p className="leading-relaxed">This is a research prototype. Accuracy is approximately 87.3%. The system analyzes text only. Optimized specifically for Algerian Darja and may not generalize well to MSA or other regional dialects.</p>
          </Card>
       </section>
       <section className="p-8 bg-gray-900 rounded-2xl text-white space-y-4 shadow-xl">
          <h2 className="text-2xl font-bold flex items-center gap-3"><BookOpen className="text-blue-400" /> {t.citeWork}</h2>
          <div className="p-4 bg-white/10 rounded-xl font-mono text-xs select-all border border-white/10 leading-relaxed">
            ENSIA Team. (2025). News Police: A Framework for Fake News Detection in Algerian Dialect Media. National Higher School of Artificial Intelligence (ENSIA), Algiers, Algeria.
          </div>
       </section>
    </div>
  );
};
