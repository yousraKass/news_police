import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card, Button, Badge } from '../components/common';
import { getQueryData } from '../services/db-api/data-api';

interface QueryDataItem {
  id: number;
  created_at: string;
  content: string;
  source: string;
  category: string;
  class: string | null;
}

export const History = () => {
  const { t, lang } = useContext(LanguageContext);
  const [items, setItems] = useState<QueryDataItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getQueryData();
      setItems(response.data || []);
    } catch (error) {
      console.error('Failed to fetch query data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = items.filter(it => 
    it.content.toLowerCase().includes(search.toLowerCase()) ||
    it.source.toLowerCase().includes(search.toLowerCase()) ||
    it.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : ''}`}>Source</th>
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : ''}`}>Category</th>
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : ''}`}>Content</th>
                    <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : ''}`}>Result</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {isLoading ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                       Loading...
                     </td>
                   </tr>
                 ) : filtered.map((it) => (
                   <tr key={it.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(it.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{it.source}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{it.category}</span>
                      </td>
                      <td className={`px-6 py-4 font-arabic text-sm truncate max-w-xs ${lang === 'ar' ? 'text-right' : ''}`} dir="rtl">{it.content}</td>
                      <td className="px-6 py-4 text-sm">
                        {it.class ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            it.class.toLowerCase().includes('fake') || it.class.toLowerCase().includes('false') 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {it.class}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not yet analyzed</span>
                        )}
                      </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">
              {search ? 'No results found for your search.' : 'No records found. Start your first analysis!'}
            </div>
          )}
       </Card>
    </div>
  );
};
