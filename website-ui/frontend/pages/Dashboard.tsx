import React, { useContext } from 'react';
import { FileText, AlertTriangle, Activity, Users, TrendingUp, Download } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';

export const Dashboard = () => {
  const { t } = useContext(LanguageContext);
  const stats = [
    { label: t.totalAnalyses, value: '1,284', trend: '+12%', icon: FileText, color: 'blue' },
    { label: t.fakeDetected, value: '342', trend: '+5%', icon: AlertTriangle, color: 'red' },
    { label: t.systemConfidence, value: '87.3%', trend: '+0.4%', icon: Activity, color: 'green' },
    { label: t.usersSupported, value: '89', trend: '+24%', icon: Users, color: 'purple' },
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{t.platformOverview}</h1><p className="text-gray-500">{t.realTimeMetrics}</p></div>
        <Button variant="secondary" onClick={() => window.print()}><Download size={16} /> {t.exportReport}</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}><stat.icon size={20} /></div>
              <span className="text-xs font-bold text-green-600 flex items-center gap-0.5"><TrendingUp size={12} /> {stat.trend}</span>
            </div>
            <div><div className="text-gray-500 text-sm font-medium">{stat.label}</div><div className="text-2xl font-bold text-gray-900">{stat.value}</div></div>
          </Card>
        ))}
      </div>
      <Card title={t.detectionTrends} className="h-[400px]">
        <div className="w-full h-full pb-10">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{n:'M',f:4,r:12,s:2},{n:'T',f:7,r:15,s:3},{n:'W',f:5,r:18,s:4},{n:'T',f:12,r:20,s:8},{n:'F',f:9,r:25,s:5},{n:'S',f:15,r:22,s:7},{n:'S',f:8,r:14,s:4}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="n" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="f" name={t.fake} stroke="#ef4444" fill="#fee2e2" />
                <Area type="monotone" dataKey="r" name={t.real} stroke="#22c55e" fill="#dcfce7" />
                <Area type="monotone" dataKey="s" name={t.satire} stroke="#f97316" fill="#ffedd5" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
