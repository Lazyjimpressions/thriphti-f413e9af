import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUpVariants, heroFadeInVariants } from "@/lib/motion";

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden min-h-[320px] max-h-[400px] md:min-h-[400px] md:max-h-[400px] flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Illustration of Dallas flea market and vintage shopping scene with city skyline" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1C392C]/80" />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8 relative z-10 h-full flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full">
          <motion.div 
            variants={heroFadeInVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Heading */}
            <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
              This Weekend<br />
              in Dallas
            </h1>

            {/* Subheading */}
            <p className="text-white text-lg md:text-xl mb-6 opacity-90">
              Your curated list of garage sales,<br />
              vintage pop-ups, and thrift gems.
            </p>

            {/* CTA Button */}
            <Button 
              className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Deal Alerts
            </Button>
          </motion.div>

          {/* Featured Deal Card */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md p-5 rounded-lg text-white border border-white/20"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="bg-thriphti-rust text-white text-sm px-3 py-1 rounded-full inline-block mb-3">
              FEATURED DEAL
            </div>
            <h3 className="font-serif text-2xl mb-2">
              Eastside Flea<br />Market
            </h3>
            <p className="opacity-90 mb-3">
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
    </section>
  );
};

export default HeroSection;
