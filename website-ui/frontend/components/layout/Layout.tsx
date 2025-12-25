import React, { useState, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LanguageContext } from '../../App';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang } = useContext(LanguageContext);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`min-h-screen flex bg-gray-50 ${lang === 'ar' ? 'rtl font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? (lang === 'ar' ? 'mr-64' : 'ml-64') : (lang === 'ar' ? 'mr-20' : 'ml-20')}`}>
        <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <div className="p-8 min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  );
};
