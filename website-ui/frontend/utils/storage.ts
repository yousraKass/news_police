import { HistoryItem } from '../types';

const STORAGE_KEY = 'news_police_history';

export const saveToHistory = (item: HistoryItem) => {
  const history = loadHistory();
  const updated = [item, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const loadHistory = (): HistoryItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const deleteFromHistory = (id: string) => {
  const history = loadHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
