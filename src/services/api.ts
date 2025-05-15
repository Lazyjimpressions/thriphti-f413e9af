
import { Event } from '@/types/event';
import { Store } from '@/types/store';
import { Article } from '@/types/article';
import { supabase } from '@/integrations/supabase/client';

export const api = {
  events: {
    getAll: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (error) throw new Error(`Failed to fetch events: ${error.message}`);
      return data || [];
    },
    getById: async (id: string): Promise<Event> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(`Failed to fetch event: ${error.message}`);
      return data;
    },
    getFeatured: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('featured', true);
      
      if (error) throw new Error(`Failed to fetch featured events: ${error.message}`);
      return data || [];
    }
  },
  stores: {
    getAll: async (): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*');
      
      if (error) throw new Error(`Failed to fetch stores: ${error.message}`);
      return data || [];
    },
    getById: async (id: string): Promise<Store> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(`Failed to fetch store: ${error.message}`);
      return data;
    },
    getFeatured: async (): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('featured', true);
      
      if (error) throw new Error(`Failed to fetch featured stores: ${error.message}`);
      return data || [];
    }
  },
  articles: {
    getAll: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*');
      
      if (error) throw new Error(`Failed to fetch articles: ${error.message}`);
      return data || [];
    },
    getBySlug: async (slug: string): Promise<Article> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw new Error(`Failed to fetch article: ${error.message}`);
      return data;
    },
    getByCategory: async (category: string): Promise<Article[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category);
      
      if (error) throw new Error(`Failed to fetch articles by category: ${error.message}`);
      return data || [];
    },
    getFeatured: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('featured', true);
      
      if (error) throw new Error(`Failed to fetch featured articles: ${error.message}`);
      return data || [];
    }
  }
};
