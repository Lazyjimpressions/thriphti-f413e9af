
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeInUpVariants } from "@/lib/motion";

interface StoreCardProps {
  id: number;
  name: string;
  image: string;
  neighborhood: string;
  city: string;
  tags: string[];
  index: number;
  isFeatured?: boolean;
}

export default function StoreCard({ 
  name, 
  image, 
  neighborhood, 
  city, 
  tags, 
  index, 
  isFeatured = false
}: StoreCardProps) {
  return (
    <motion.div
      className="flex flex-col h-full"
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        {isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-thriphti-gold text-thriphti-charcoal hover:bg-thriphti-gold/90">
              Editor's Pick
            </Badge>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className="font-serif text-2xl mb-1 text-thriphti-charcoal">{name}</h3>
        <div className="flex items-center text-sm text-thriphti-charcoal/70 mb-3">
          <MapPin size={14} className="inline mr-1" />
          <span>{neighborhood} • {city}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-thriphti-ivory border-thriphti-gold/30 text-thriphti-charcoal hover:bg-thriphti-gold/20"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <Button 
        className="w-full bg-thriphti-rust hover:bg-thriphti-rust/90 text-white mt-auto"
      >
        View Profile
      </Button>
    </motion.div>
  );
}
