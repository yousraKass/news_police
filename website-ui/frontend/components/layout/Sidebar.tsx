import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Home, LayoutDashboard, BarChart3, History, Info 
} from 'lucide-react';
import { LanguageContext } from '../../App';

export const Sidebar: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { t } = useContext(LanguageContext);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t.home },
    { path: '/dashboard', icon: LayoutDashboard, label: t.dashboard },
    { path: '/detect', icon: ShieldCheck, label: t.detectNews },
    { path: '/about', icon: Info, label: t.about },
  ];

  return (  
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-40 no-print`}>
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0">
          <ShieldCheck size={24} />
        </div>
        {isOpen && <span className="font-bold text-xl text-gray-900 tracking-tight whitespace-nowrap">{t.title}</span>}
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors no-underline ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <item.icon size={20} className={isActive ? 'text-blue-600 shrink-0' : 'shrink-0'} />
              {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
