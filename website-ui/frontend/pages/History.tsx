import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Trash2, Search } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card, Button, Badge } from '../components/common';
import { loadHistory, deleteFromHistory } from '../utils';
import { HistoryItem } from '../types';

export const History = () => {
  const { t, lang } = useContext(LanguageContext);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteFromHistory(id);
      setItems(loadHistory());
    }
  };

  const filtered = items.filter(it => 
    it.inputText.toLowerCase().includes(search.toLowerCase()) ||
    it.metadata.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 fade-in">
       <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t.history}</h1>
          <div className="flex gap-4">
            <div className="relative no-print">
               <Search size={18} className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
               <input 
                 type="text" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder={t.searchHistory} 
                 className={`${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none w-64`} 
               />
            </div>
            <Button onClick={() => navigate('/detect')}><Plus size={16} /> {t.newAnalysis}</Button>
          </div>
       </div>
       <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                 <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : ''}`}>Date</th>
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : ''}`}>Result</th>
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : ''}`}>Content</th>
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filtered.map((it) => (
                   <tr key={it.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{it.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge status={it.status} /></td>
                      <td className={`px-6 py-4 font-arabic text-sm truncate max-w-xs ${lang === 'ar' ? 'text-right' : ''}`} dir="rtl">{it.inputText}</td>
                      <td className={`px-6 py-4 whitespace-nowrap ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                        <div className="flex justify-end gap-2">
                           <Button variant="ghost" className="p-2" onClick={() => navigate(`/results/${it.id}`, { state: { result: it } })}>
                             <ArrowRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                           </Button>
                           <Button variant="ghost" className="p-2 text-red-500 hover:text-red-600" onClick={() => handleDelete(it.id)}>
                             <Trash2 size={16} />
                           </Button>
                        </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">
              {search ? 'No results found for your search.' : 'No records found. Start your first analysis!'}
            </div>
          )}
       </Card>
    </div>
  );
};
