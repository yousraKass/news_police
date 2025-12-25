export const SAMPLE_TEXTS = [
  { title: "Politics (Fake)", text: "عاجل وخطير جدا.. اكتشاف مؤامرة خارجية تستهدف استقرار الجزائر من طرف جهات مجهولة تحاول بث الفتنة بين الشعب.", source: "Facebook", category: "Politics" },
  { title: "Health (Real)", text: "وزارة الصحة الجزائرية تعلن عن إطلاق حملة وطنية للتلقيح ضد الأنفلونزا الموسمية ابتداء من الأسبوع المقبل.", source: "El Khabar", category: "Health" },
  { title: "Sports (Satire)", text: "رسميا: الفيفا تقرر إعادة مباراة الجزائر والكاميرون بسبب اكتشاف أن الحكم بكاري غاساما كان يرتدي جوارب غير قانونية.", source: "Saraha News", category: "Sports" }
];

export const PERFORMANCE_METRICS = [
  { metric: 'Precision', value: 0.88 },
  { metric: 'Recall', value: 0.83 },
  { metric: 'F1-Score', value: 0.85 },
  { metric: 'Accuracy', value: 0.87 },
  { metric: 'Specificity', value: 0.89 }
];

export const SOURCE_DATA = [
  { name: 'Facebook', value: 45, fill: '#1E88E5' }, 
  { name: 'WhatsApp', value: 28, fill: '#43A047' }, 
  { name: 'X/Twitter', value: 12, fill: '#212121' }, 
  { name: 'Others', value: 15, fill: '#FB8C00' }
];

export const CONFIDENCE_DISTRIBUTION = [
  { range: '0-20%', count: 12 },
  { range: '21-40%', count: 45 },
  { range: '41-60%', count: 120 },
  { range: '61-80%', count: 450 },
  { range: '81-100%', count: 657 },
];
