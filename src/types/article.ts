
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  publishedAt: string; // This will be mapped from 'published_at' from Supabase
  category: string;
  tags: string[];
  city: string;
  source_url?: string;
}
