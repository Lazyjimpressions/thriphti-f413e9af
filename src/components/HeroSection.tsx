
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center pt-16">
      {/* Background Image with single overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/0120f703-c1a7-4b4c-8a18-beb9d564e28d.png"
          alt="Dallas flea market"
          className="w-full h-full object-cover"
        />
        {/* Single dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="thriphti-container relative z-10 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <motion.div 
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif mb-4 leading-tight">
              This Weekend<br />in Dallas
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Your curated list of garage sales, vintage pop-ups, and thrift gems.
            </p>
            <Button 
              size="lg" 
              className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white font-medium px-8 py-6 text-lg"
            >
              Get Deal Alerts
            </Button>
          </motion.div>

          {/* Featured Deal Card - positioned at bottom right on desktop */}
          <motion.div 
            className="mt-12 md:mt-auto md:absolute md:right-6 md:bottom-16 lg:bottom-24 md:max-w-sm w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-black/50 backdrop-blur-sm p-6 text-white border-none shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-thriphti-rust text-white border-none uppercase font-bold text-xs px-3 py-1">
                  Featured Deal
                </Badge>
              </div>
              <h3 className="text-3xl font-serif mb-3">Eastside Flea Market</h3>
              <p className="mb-4 text-white/90">50% off admission this Saturday only. Bring this coupon for early access.</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Apr 27-28</span>
                <Button variant="ghost" className="text-thriphti-gold hover:text-thriphti-gold/90 p-0 flex items-center gap-1">
                  View Details
                  <ArrowRight size={16} />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
