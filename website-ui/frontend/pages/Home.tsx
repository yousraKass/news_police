import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Cpu, Layers, Lock } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';

export const Home = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10 fade-in">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
          <Activity size={16} /> {t.tagline}
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">{t.heroTitle}</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">{t.heroDesc}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Cpu, title: "DziriBERT Engine", desc: "Fine-tuned transformer model optimized for colloquial Algerian Arabic." },
          { icon: Layers, title: "3-Class Detection", desc: "Categorization into Fake, Real, and Satire with state-of-the-art accuracy." },
          { icon: Lock, title: "Explainable AI", desc: "Decision rationale provided through linguistic marker analysis." }
        ].map((feat, i) => (
          <Card key={i} className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><feat.icon size={24} /></div>
            <h3 className="text-xl font-bold text-gray-900">{feat.title}</h3>
            <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
