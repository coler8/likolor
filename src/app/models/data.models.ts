export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'generic';

export interface Link {
  id?: string;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
  platform: Platform;
  createdAt: number;
  tags?: string[];
  fav?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex code or Tailwind class
  icon: string; // Material icon name or SVG path
}
