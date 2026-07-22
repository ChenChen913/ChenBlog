export interface CategoryConfig {
  key: string;
  label: string;
  label_en: string;
}

export const categories: CategoryConfig[] = [
  { key: 'tech', label: '技术', label_en: 'Tech' },
  { key: 'life', label: '生活', label_en: 'Life' },
  { key: 'reading', label: '读书', label_en: 'Reading' },
  { key: 'AI', label: 'AI', label_en: 'AI' },
  { key: 'product', label: '产品', label_en: 'Product' },
  { key: 'career', label: '职场', label_en: 'Career' },
  { key: 'finance', label: '理财', label_en: 'Finance' },
  { key: 'travel', label: '旅行', label_en: 'Travel' },
  { key: 'food', label: '美食', label_en: 'Food' },
  { key: 'music', label: '音乐', label_en: 'Music' },
  { key: 'movie', label: '电影', label_en: 'Movie' },
  { key: 'game', label: '游戏', label_en: 'Game' },
];

export function getCategoryLabel(key: string, lang: 'zh' | 'en'): string {
  const category = categories.find(c => c.key.toLowerCase() === key.toLowerCase());
  if (category) {
    return lang === 'en' ? category.label_en : category.label;
  }
  return key;
}
