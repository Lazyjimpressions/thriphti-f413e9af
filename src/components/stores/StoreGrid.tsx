import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import StoreCard from "./StoreCard";
import { staggerContainerVariants } from "@/lib/motion";
import { getApprovedStores } from '@/integrations/supabase/queries';
import type { Database } from '@/integrations/supabase/types';

// Type alias for store
// This matches the Supabase schema
type Store = Database['public']['Tables']['stores']['Row'];

const DEFAULT_STORE_IMAGE = "/images/store_image1.png";

export default function StoreGrid() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getApprovedStores()
      .then(setStores)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center">Loading stores...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <section className="py-12">
      <div className="thriphti-container">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stores.map((store, index) => (
            <StoreCard
              key={store.id}
              id={store.id}
              name={store.name}
              image={store.images?.[0] || DEFAULT_STORE_IMAGE}
              neighborhood={''}
              city={store.city || ''}
              tags={store.category || []}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
