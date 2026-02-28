export const CATEGORY_COLORS: Record<string, string> = {
  Music: '#FF6B9D',
  Tech: '#38BDF8',
  Comedy: '#F5A623',
  Sports: '#22D3A0',
  Food: '#FB923C',
  Art: '#C084FC',
  Business: '#94A3B8',
};

export const CATEGORIES = ['All', 'Music', 'Tech', 'Comedy', 'Sports', 'Food', 'Art', 'Business'] as const;

export const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat] || '#6C63FF';
