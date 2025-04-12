
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface StoreHeaderProps {
  name: string;
  subtitle: string;
  image: string;
}

export default function StoreHeader({ name, subtitle, image }: StoreHeaderProps) {
  return (
    <header className="relative">
      {/* Hero Image */}
      <div className="w-full h-64 md:h-80 lg:h-96 relative">
        <div className="absolute inset-0 bg-thriphti-green/50 z-10" />
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content Overlay */}
      <div className="thriphti-container relative z-20 -mt-40 md:-mt-48 pb-12">
        <motion.div 
          className="bg-thriphti-ivory p-6 md:p-8 rounded-lg shadow-md max-w-3xl"
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="uppercase text-sm text-thriphti-charcoal/70 tracking-wider mb-2">
            {subtitle}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-thriphti-charcoal mb-6">
            {name}
          </h1>
          
          <div className="flex flex-wrap gap-4">
            <Button className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white">
              Write a Review
            </Button>
            <Button variant="outline" className="border-thriphti-green text-thriphti-green hover:bg-thriphti-green/10">
              <Bookmark size={18} className="mr-2" />
              Save Store
            </Button>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
