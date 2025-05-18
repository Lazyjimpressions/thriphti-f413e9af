
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  publishedAt: string; // This needs to be mapped to the 'publishedat' from Supabase
  category: string;
  tags: string[];
  city: string;
}
