import React, { useContext } from 'react';
import { DetectionStatus } from '../../types';
import { LanguageContext } from '../../App';

export const Badge: React.FC<{ status: DetectionStatus }> = ({ status }) => {
  const { t } = useContext(LanguageContext);
  const styles: Record<DetectionStatus, string> = {
    'Fake': 'bg-red-50 text-red-700 border-red-200',
    'Real': 'bg-green-50 text-green-700 border-green-200',
    'Satire': 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status === 'Fake' ? t.fake : status === 'Real' ? t.real : t.satire}
    </span>
  );
};
