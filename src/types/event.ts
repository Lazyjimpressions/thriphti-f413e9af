
export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: Date;
  start_time?: string;
  end_time?: string;
  location: string;
  venue?: string;
  image_url?: string;
  category: string;
  neighborhood?: string;
  price_range?: string;
  featured?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
} 
