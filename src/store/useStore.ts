import { create } from 'zustand';
import { Event } from '@/types/event';
import { Store } from '@/types/store';

interface AppState {
  events: Event[];
  stores: Store[];
  selectedCity: string;
  setEvents: (events: Event[]) => void;
  setStores: (stores: Store[]) => void;
  setSelectedCity: (city: string) => void;
}

export const useStore = create<AppState>((set) => ({
  events: [],
  stores: [],
  selectedCity: 'Dallas',
  setEvents: (events) => set({ events }),
  setStores: (stores) => set({ stores }),
  setSelectedCity: (city) => set({ selectedCity: city }),
})); 