
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function StoresHeader() {
  return (
    <header className="relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1527576539890-dfa815648363?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Dallas-Fort Worth streetscape" 
          className="w-full h-64 md:h-80 object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-thriphti-green/70" />
      </div>
      
      {/* Header Content */}
      <div className="relative z-10 py-16 md:py-20 thriphti-container text-center text-white">
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 max-w-4xl mx-auto">
            Thrift & Consignment Stores in Dallas–Fort Worth
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
            Hand-picked resale shops, benefit stores, and hidden gems around the metroplex.
          </p>
        </motion.div>
      </div>
    </header>
  );
}
