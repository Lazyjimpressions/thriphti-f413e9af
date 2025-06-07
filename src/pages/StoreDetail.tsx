
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, Bookmark, Facebook, Instagram, ExternalLink } from "lucide-react";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StoreHeader from "@/components/storeDetail/StoreHeader";
import StoreInfoPanel from "@/components/storeDetail/StoreInfoPanel";
import ReviewCard from "@/components/storeDetail/ReviewCard";
import RelatedArticle from "@/components/storeDetail/RelatedArticle";
import { getStoreByIdWithChain, getStoreReviews } from '@/integrations/supabase/queries';
import type { Database } from '@/types/supabase';

const DEFAULT_HERO_IMAGE = "/images/store_image2.png";

export default function StoreDetail() {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Database['public']['Tables']['stores']['Row'] & { store_chains?: any } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getStoreByIdWithChain(storeId),
      getStoreReviews(storeId)
    ])
      .then(([storeData, reviewsData]) => {
        setStore(storeData);
        setReviews(reviewsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error || !store) {
    return (
      <div className="min-h-screen bg-thriphti-ivory pt-32 flex justify-center">
        <div className="thriphti-container">
          <h1 className="font-serif text-4xl text-thriphti-green mb-4">Store not found</h1>
          <p>{error || "The store you're looking for doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{store.name} | Thriphti</title>
        <meta 
          name="description" 
          content={`Discover ${store.name} - ${store.description?.substring(0, 150) || ''}...`}
        />
      </Helmet>
      <main>
        <StoreHeader 
          name={store.location_name || store.name}
          subtitle={store.store_chains?.name || store.category?.join(', ') || ''}
          image={store.images?.[0] || DEFAULT_HERO_IMAGE}
        />
        
        <div className="thriphti-container py-12">
          {/* Chain Info Banner */}
          {store.store_chains && (
            <motion.div 
              className="bg-thriphti-green/10 border border-thriphti-green/20 rounded-lg p-4 mb-8"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {store.store_chains.logo_url && (
                    <img 
                      src={store.store_chains.logo_url} 
                      alt={`${store.store_chains.name} logo`}
                      className="w-10 h-10 object-contain"
                    />
                  )}
                  <div>
                    <p className="text-sm text-thriphti-charcoal/70">Part of</p>
                    <p className="font-medium text-thriphti-green">{store.store_chains.name}</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-thriphti-green text-thriphti-green hover:bg-thriphti-green/10"
                  asChild
                >
                  <Link to={`/chains/${store.store_chains.id}`}>
                    View All Locations
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Image Gallery */}
          {store.images && store.images.length > 1 && (
            <div className="flex gap-4 mb-8 overflow-x-auto">
              {store.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={store.name}
                  className="h-48 rounded shadow object-cover"
                />
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="lg:col-span-2"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="sr-only">Store Description</h2>
              <p className="text-lg text-thriphti-charcoal mb-6">
                {store.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {store.is_flagship && (
                  <Badge className="bg-thriphti-gold text-thriphti-charcoal">
                    Flagship Location
                  </Badge>
                )}
                {store.category?.map((category, index) => (
                  <Badge key={index} variant="outline" className="bg-thriphti-ivory border-thriphti-green text-thriphti-green hover:bg-thriphti-green/10">
                    {category}
                  </Badge>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
            >
              <StoreInfoPanel 
                website={store.website || ''}
                address={store.address || ''}
                neighborhood={''}
                phone={store.phone || ''}
                hours={[]}
              />
            </motion.div>
          </div>
          
          {/* Reviews Section */}
          <motion.section 
            className="mb-16"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl text-thriphti-green">Reviews</h2>
              <Button className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white">
                Write a Review
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <ReviewCard 
                  key={review.id}
                  user={review.profiles?.full_name || 'Anonymous'}
                  avatar={''}
                  rating={review.rating || 0}
                  text={review.comment || ''}
                  date={review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                />
              ))}
            </div>
          </motion.section>
          
          {/* Related Articles (optional, not implemented) */}
        </div>
      </main>
    </Layout>
  );
}
