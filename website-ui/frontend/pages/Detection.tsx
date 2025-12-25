
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';
import { generateMockAnalysis, saveToHistory } from '../utils';
import { SAMPLE_TEXTS, CATEGORIES } from '../data';
import { postQueryData } from '../services/db-api/data-api';


export const Detection = () => {
  const { t, lang } = useContext(LanguageContext);
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // Fix: Await the updated asynchronous generateMockAnalysis call
  const handleAnalysis = async (e: any) => {
    e.preventDefault();
    if (text.length < 20) return;
    setIsLoading(true);
    
    // Initial stage of processing
    for (let i = 0; i <= 60; i += 20) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 400));
    }


    
    try {
            // Store in database
      await postQueryData({
        content: text,
        source: source || 'social media',
        category: category
      });

      const res = await generateMockAnalysis(text, { source, category });
      setProgress(100);
      saveToHistory(res);
      setIsLoading(false);
      navigate(`/results/${res.id}`, { state: { result: res } });
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsLoading(false);
      alert("Analysis failed. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{t.newAnalysis}</h1>
        <p className="text-gray-500">{t.scanText}</p>
      </div>
      {isLoading ? (
        <Card className="p-12 text-center space-y-8">
           <div className="flex flex-col items-center gap-6">
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{width: `${progress}%`}}></div>
              </div>
              <p className="text-gray-400 font-medium italic animate-pulse">{t.processing} {progress}%</p>
           </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleAnalysis} className="space-y-6">
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder={t.newsContent} 
              className={`w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg resize-none ${lang === 'ar' ? 'font-arabic text-right' : ''}`} 
              dir={lang === 'ar' ? 'rtl' : 'ltr'} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder={t.source} 
                className={`p-2 border rounded-lg ${lang === 'ar' ? 'text-right' : ''}`} 
              />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`p-2 border rounded-lg bg-white ${lang === 'ar' ? 'text-right' : ''}`}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((s, i) => (
                <Button 
                  key={i} 
                  variant="secondary" 
                  className="text-xs" 
                  onClick={() => { setText(s.text); setSource(s.source); setCategory(s.category); }}
                >
                  {t.loadSample} {i+1}
                </Button>
              ))}
            </div>
            <Button type="submit" className="w-full py-4 text-lg font-bold" disabled={text.length < 20}>
              {t.analyzeContent} <ShieldCheck size={20} />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
