export interface Store {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  categories: string[];
  images: string[];
  featured?: boolean;
}

export interface StoreCardProps {
  store: Store;
  onSelect?: (store: Store) => void;
} 