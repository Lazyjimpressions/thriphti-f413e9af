
import { motion } from "framer-motion";
import { fadeInUpVariants, heroFadeInVariants } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ThisWeekendHeroProps {
  onSearchInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export default function ThisWeekendHero({ onSearchInput, onSearchSubmit }: ThisWeekendHeroProps) {
  const currentDate = new Date();
  // Format date as "May 18-19" (current weekend)
  const startDay = currentDate.getDate();
  const endDay = startDay + 1;
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const formattedDate = `${month} ${startDay}-${endDay}`;
  
  return (
    <section className="relative w-full overflow-hidden min-h-[420px] flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Illustration of Dallas flea market and vintage shopping scene with city skyline" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-thriphti-green/80" />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8 relative z-10 h-full flex items-center py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            variants={heroFadeInVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <span className="inline-block bg-thriphti-rust text-white px-4 py-1 rounded-sm text-sm uppercase tracking-wider mb-4">
              {formattedDate}
            </span>
            {/* Main Heading */}
            <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
              Thrift Events in Dallas<br />
              This Weekend
            </h1>

            {/* Subheading */}
            <p className="text-white text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Your curated list of garage sales, vintage pop-ups, and thrift stores with special deals this weekend.
            </p>

            {/* Search Field */}
            <form 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              onSubmit={onSearchSubmit}
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Find events by neighborhood" 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-thriphti-rust"
                  onChange={onSearchInput}
                />
              </div>
              <Button type="submit" className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white py-3 px-6">
                Search
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
