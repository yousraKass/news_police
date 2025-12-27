
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';
import { generateMockAnalysis, saveToHistory } from '../utils';
import { SAMPLE_TEXTS, CATEGORIES } from '../data';
import { postQueryData } from '../services/db-api/data-api';
import { retrieveSimilarDocs } from '../services/ai-api/retrieve';


export const Detection = () => {
  const { t, lang } = useContext(LanguageContext);
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [similarDocs, setSimilarDocs] = useState<any[]>([]);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const navigate = useNavigate();


  // Retrieve similar documents
  const handleRetrieve = async () => {
    if (text.trim().length < 10) return;
    setIsRetrieving(true);
    try {
      const result = await retrieveSimilarDocs(text, 4);
      setSimilarDocs(result.results || []);
    } catch (error) {
      console.error("Retrieval failed:", error);
    } finally {
      setIsRetrieving(false);
    }
  };
  // Check if the form is valid for submission
  const isFormValid = text.trim().length >= 20 && category.trim().length > 0;

  // Fix: Await the updated asynchronous generateMockAnalysis call
  const handleAnalysis = async (e: any) => {
    e.preventDefault();
    if (!isFormValid) return;
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
            <div className="flex gap-4">
              <Button type="submit" className="flex-1 py-4 text-lg font-bold" disabled={!isFormValid}>
                {t.analyzeContent} <ShieldCheck size={20} />
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="py-4 px-6 text-lg font-bold" 
                onClick={handleRetrieve}
                disabled={text.trim().length < 10}
              >
                Retrieve Similar <FileText size={20} />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Similar Documents Section */}
      {isRetrieving && (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-gray-500 animate-pulse">Retrieving similar documents...</p>
          </div>
        </Card>
      )}

      {!isRetrieving && similarDocs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Similar Documents</h2>
          <div className="grid gap-4">
            {similarDocs.map((doc, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600">Document {idx + 1}</span>
                    {doc.metadata?.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {doc.metadata.category}
                      </span>
                    )}
                  </div>
                  <p className={`text-gray-800 leading-relaxed ${lang === 'ar' ? 'text-right font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {doc.content}
                  </p>
                  {doc.metadata?.source && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Source:</span>{' '}
                      {doc.metadata.source.includes('http') ? (
                        <a href={doc.metadata.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {doc.metadata.source}
                        </a>
                      ) : (
                        doc.metadata.source
                      )}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
