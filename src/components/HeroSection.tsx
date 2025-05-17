import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUpVariants, heroFadeInVariants } from "@/lib/motion";

const HeroSection = () => {
  return (
    <div className="relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Dallas thrift scene" 
          className="w-full h-[70vh] object-cover"
        />
        <div className="absolute inset-0 bg-[#1C392C]/80" />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            variants={heroFadeInVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Heading */}
            <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              This Weekend<br />
              in Dallas
            </h1>

            {/* Subheading */}
            <p className="text-white text-xl md:text-2xl mb-8 opacity-90">
              Your curated list of garage sales,<br />
              vintage pop-ups, and thrift gems.
            </p>

            {/* CTA Button */}
            <Button 
              className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Deal Alerts
            </Button>
          </motion.div>

          {/* Featured Deal Card */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md p-6 rounded-lg text-white border border-white/20"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="bg-thriphti-rust text-white text-sm px-3 py-1 rounded-full inline-block mb-4">
              FEATURED DEAL
            </div>
            <h3 className="font-serif text-3xl mb-3">
              Eastside Flea<br />Market
            </h3>
            <p className="opacity-90 mb-4">
              50% off admission this Saturday only. Bring this coupon for early access.
            </p>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              View Details
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
