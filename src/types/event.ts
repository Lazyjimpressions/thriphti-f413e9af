export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl?: string;
  price?: string;
  category: 'garage-sale' | 'flea-market' | 'pop-up' | 'consignment';
  featured?: boolean;
}

export interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
} 