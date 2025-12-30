import React, { useState, useEffect, createContext } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { 
  Home, Dashboard, Detection, Results, Visualization, History, About 
} from './pages';
import { Language, TRANSLATIONS } from './data';

interface LanguageContextProps {
  lang: Language;
  setLang: (l: Language) => void;
  t: any;
}

export const LanguageContext = createContext<LanguageContextProps>({ 
  lang: 'en', 
  setLang: () => {}, 
  t: TRANSLATIONS.en 
});

const App = () => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('news_police_lang') as Language) || 'en';
  });
  
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('news_police_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/detect" element={<Detection />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/visualize" element={<Visualization />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;
