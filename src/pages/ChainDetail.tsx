
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, Store, Calendar } from "lucide-react";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StoreCard from "@/components/stores/StoreCard";
import { getStoreChainWithLocations } from '@/integrations/supabase/chainQueries';
import type { Database } from '@/integrations/supabase/types';

type StoreChain = Database['public']['Tables']['store_chains']['Row'];
type Store = Database['public']['Tables']['stores']['Row'];

export default function ChainDetail() {
  const { chainId } = useParams<{ chainId: string }>();
  const [chain, setChain] = useState<StoreChain | null>(null);
  const [locations, setLocations] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chainId) return;
    
    setLoading(true);
    setError(null);
    
    getStoreChainWithLocations(chainId)
      .then((data) => {
        setChain(data);
        setLocations(data.stores || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [chainId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !chain) {
    return (
      <div className="min-h-screen bg-thriphti-ivory pt-32 flex justify-center">
        <div className="thriphti-container">
          <h1 className="font-serif text-4xl text-thriphti-green mb-4">Chain not found</h1>
          <p>{error || "The chain you're looking for doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  const approvedLocations = locations.filter(store => store.approved);

  return (
    <Layout>
      <Helmet>
        <title>{chain.name} Locations | Thriphti</title>
        <meta 
          name="description" 
          content={`Find all ${chain.name} thrift store locations. ${chain.description?.substring(0, 150)}...`}
        />
      </Helmet>
      
      <main className="bg-thriphti-ivory min-h-screen pt-24">
        <div className="thriphti-container py-12">
          {/* Chain Header */}
          <motion.div 
            className="text-center mb-12"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              {chain.logo_url && (
                <img 
                  src={chain.logo_url} 
                  alt={`${chain.name} logo`}
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h1 className="font-serif text-4xl md:text-5xl text-thriphti-charcoal mb-2">
                  {chain.name}
                </h1>
                {chain.headquarters_city && (
                  <div className="flex items-center justify-center text-thriphti-charcoal/70">
                    <MapPin size={16} className="mr-2" />
                    <span>{chain.headquarters_city}, {chain.headquarters_state}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {chain.chain_type && (
                <Badge className="bg-thriphti-green text-white">
                  {chain.chain_type}
                </Badge>
              )}
              {chain.founded_year && (
                <Badge variant="outline" className="border-thriphti-gold text-thriphti-charcoal">
                  <Calendar size={14} className="mr-1" />
                  Est. {chain.founded_year}
                </Badge>
              )}
              <Badge variant="outline" className="border-thriphti-rust text-thriphti-rust">
                <Store size={14} className="mr-1" />
                {approvedLocations.length} locations
              </Badge>
            </div>
            
            {chain.description && (
              <p className="text-lg text-thriphti-charcoal/80 max-w-3xl mx-auto mb-6">
                {chain.description}
              </p>
            )}
            
            {chain.website && (
              <Button
                onClick={() => window.open(chain.website!, '_blank')}
                className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white"
              >
                <ExternalLink size={16} className="mr-2" />
                Visit Website
              </Button>
            )}
          </motion.div>
          
          {/* Locations Grid */}
          <motion.section
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="font-serif text-3xl text-thriphti-green mb-8 text-center">
              Store Locations
            </h2>
            
            {approvedLocations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {approvedLocations.map((store, index) => (
                  <StoreCard
                    key={store.id}
                    id={store.id}
                    name={store.location_name || store.name}
                    image={store.images?.[0] || '/images/store_image2.png'}
                    neighborhood={store.address || ''}
                    city={store.city}
                    tags={store.category || []}
                    index={index}
                    isFeatured={store.is_flagship}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-thriphti-charcoal/60">
                <Store size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No approved locations found for this chain.</p>
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </Layout>
  );
}
