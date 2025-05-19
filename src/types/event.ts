
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location: string;
  venue?: string | null;
  image_url?: string | null;
  category: string;
  neighborhood?: string | null;
  price_range?: string | null;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  day_of_week?: string; // Added for the events by day view
}

export interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
} 
