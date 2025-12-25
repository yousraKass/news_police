import React, { useContext, useState } from 'react';
import { Menu, Search, Globe, ChevronDown } from 'lucide-react';
import { LanguageContext } from '../../App';
import { Language } from '../../data';

export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { lang, setLang, t } = useContext(LanguageContext);
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 no-print">
      <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
        <Menu size={20} />
      </button>
      
      <div className="flex items-center gap-4">
         <div className="relative group">
            <Search size={18} className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
            <input 
              type="text" 
              placeholder={t.searchHistory} 
              className={`${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64`} 
            />
         </div>
         
         <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              <Globe size={18} />
              <span className="uppercase">{lang}</span>
              <ChevronDown size={14} />
            </button>
            {isLangOpen && (
              <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden`}>
                <button onClick={() => {setLang('en'); setIsLangOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">English</button>
                <button onClick={() => {setLang('fr'); setIsLangOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Français</button>
                <button onClick={() => {setLang('ar'); setIsLangOpen(false);}} className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} px-4 py-2 hover:bg-gray-50 text-sm font-arabic`}>العربية</button>
              </div>
            )}
         </div>
      </div>
    </header>
  );
};
