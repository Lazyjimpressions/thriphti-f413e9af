
import { Event } from '@/types/event';
import { Store } from '@/types/store';
import { Article } from '@/types/article';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = {
  events: {
    getAll: async (): Promise<Event[]> => {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    getById: async (id: string): Promise<Event> => {
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    getFeatured: async (): Promise<Event[]> => {
      const response = await fetch(`${API_BASE_URL}/events/featured`);
      if (!response.ok) throw new Error('Failed to fetch featured events');
      return response.json();
    }
  },
  stores: {
    getAll: async (): Promise<Store[]> => {
      const response = await fetch(`${API_BASE_URL}/stores`);
      if (!response.ok) throw new Error('Failed to fetch stores');
      return response.json();
    },
    getById: async (id: string): Promise<Store> => {
      const response = await fetch(`${API_BASE_URL}/stores/${id}`);
      if (!response.ok) throw new Error('Failed to fetch store');
      return response.json();
    },
    getFeatured: async (): Promise<Store[]> => {
      const response = await fetch(`${API_BASE_URL}/stores/featured`);
      if (!response.ok) throw new Error('Failed to fetch featured stores');
      return response.json();
    }
  },
  articles: {
    getAll: async (): Promise<Article[]> => {
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
    getBySlug: async (slug: string): Promise<Article> => {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      return response.json();
    },
    getByCategory: async (category: string): Promise<Article[]> => {
      const response = await fetch(`${API_BASE_URL}/articles/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch articles by category');
      return response.json();
    },
    getFeatured: async (): Promise<Article[]> => {
      const response = await fetch(`${API_BASE_URL}/articles/featured`);
      if (!response.ok) throw new Error('Failed to fetch featured articles');
      return response.json();
    }
  }
}; 
