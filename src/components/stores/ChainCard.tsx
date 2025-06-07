
import { motion } from "framer-motion";
import { MapPin, ExternalLink, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeInUpVariants } from "@/lib/motion";
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type StoreChain = Database['public']['Tables']['store_chains']['Row'];

interface ChainCardProps {
  chain: StoreChain;
  index: number;
  locationCount?: number;
}

export default function ChainCard({ chain, index, locationCount }: ChainCardProps) {
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl text-thriphti-charcoal">{chain.name}</CardTitle>
              {chain.headquarters_city && (
                <div className="flex items-center text-sm text-thriphti-charcoal/70 mt-2">
                  <MapPin size={14} className="mr-1" />
                  <span>{chain.headquarters_city}, {chain.headquarters_state}</span>
                </div>
              )}
            </div>
            {chain.logo_url && (
              <img 
                src={chain.logo_url} 
                alt={`${chain.name} logo`}
                className="w-12 h-12 object-contain"
              />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {chain.description && (
            <p className="text-sm text-thriphti-charcoal/80 line-clamp-3">
              {chain.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {chain.chain_type && (
              <Badge variant="outline" className="bg-thriphti-ivory border-thriphti-green text-thriphti-green">
                {chain.chain_type}
              </Badge>
            )}
            {chain.founded_year && (
              <Badge variant="outline" className="bg-thriphti-ivory border-thriphti-gold text-thriphti-charcoal">
                Est. {chain.founded_year}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-sm text-thriphti-charcoal/70">
              <Store size={14} className="mr-1" />
              <span>{locationCount || chain.total_locations || 0} locations</span>
            </div>
            
            <div className="flex gap-2">
              {chain.website && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(chain.website!, '_blank')}
                  className="border-thriphti-green text-thriphti-green hover:bg-thriphti-green/10"
                >
                  <ExternalLink size={14} />
                </Button>
              )}
              <Button 
                size="sm"
                className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white"
                asChild
              >
                <Link to={`/chains/${chain.id}`}>View Locations</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
