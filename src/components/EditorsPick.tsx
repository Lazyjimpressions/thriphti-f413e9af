
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function EditorsPick() {
  return (
    <section className="py-16 bg-thriphti-ivory">
      <div className="thriphti-container">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="aspect-[4/3] overflow-hidden rounded-lg"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <img 
              src="https://images.unsplash.com/photo-1627040411258-1ff09c28c75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Flea Markets Guide" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <motion.div 
            className="flex flex-col justify-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="tag mb-4">Guide</div>
            <h2 className="font-serif text-3xl md:text-4xl text-thriphti-green mb-4">
              Guide To Flea Markets In DFW
            </h2>
            <p className="text-lg mb-6">
              Discover the best weekend flea markets and where to find incredible vintage treasures in the Dallas-Fort Worth area.
            </p>
            <Button 
              className="bg-thriphti-green hover:bg-thriphti-green/90 text-white self-start flex items-center gap-2"
            >
              Read The Guide
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
