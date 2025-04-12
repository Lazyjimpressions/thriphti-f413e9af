
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-black">
        <img
          src="https://images.unsplash.com/photo-1523380744952-b7e00e6e2ffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
          alt="Dallas flea market"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Content */}
      <div className="thriphti-container relative z-10 text-white">
        <motion.div 
          className="max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">
            This Weekend in Dallas
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            The best thrift events, handpicked by locals.
          </p>
          <Button 
            size="lg" 
            className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white"
          >
            Sign up for alerts
          </Button>
        </motion.div>

        {/* Featured Deal Card */}
        <motion.div 
          className="mt-12 md:absolute md:right-6 md:top-1/2 md:transform md:-translate-y-1/2 md:mt-0 md:max-w-sm w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm p-6 text-thriphti-charcoal border-none">
            <div className="tag mb-4">Featured Deal</div>
            <h3 className="text-2xl font-serif mb-2">Eastside Flea Market</h3>
            <p className="mb-4">50% off admission this Saturday only. Bring this coupon for early access at 8am.</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Valid Apr 27-28</span>
              <Button variant="ghost" className="text-thriphti-rust hover:text-thriphti-rust/90 p-0 flex items-center gap-1">
                View Details
                <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
