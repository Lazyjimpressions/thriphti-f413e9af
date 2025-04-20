import { Event } from '@/types/event';
import { Store } from '@/types/store';

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
  }
}; 