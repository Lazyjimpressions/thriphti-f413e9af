
import { motion } from "framer-motion";
import { fadeInUpVariants, heroFadeInVariants } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { TimeRange } from "@/pages/Events";

interface EventsHeroProps {
  timeRange: TimeRange;
  onSearchInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export default function EventsHero({ timeRange, onSearchInput, onSearchSubmit }: EventsHeroProps) {
  const getDateRange = () => {
    const currentDate = new Date();
    
    switch (timeRange) {
      case 'this-weekend':
        const startDay = currentDate.getDate();
        const endDay = startDay + 1;
        const month = currentDate.toLocaleString('default', { month: 'long' });
        return `${month} ${startDay}-${endDay}`;
      
      case 'next-week':
        return 'Next Week';
      
      case 'this-month':
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      case 'all-upcoming':
        return 'Upcoming Events';
      
      default:
        return 'This Weekend';
    }
  };

  const getTitle = () => {
    switch (timeRange) {
      case 'this-weekend':
        return 'Thrift Events in Dallas This Weekend';
      case 'next-week':
        return 'Thrift Events in Dallas Next Week';
      case 'this-month':
        return 'Thrift Events in Dallas This Month';
      case 'all-upcoming':
        return 'Upcoming Thrift Events in Dallas';
      default:
        return 'Thrift Events in Dallas';
    }
  };

  const getSubtitle = () => {
    switch (timeRange) {
      case 'this-weekend':
        return 'Your curated list of garage sales, vintage pop-ups, and thrift stores with special deals this weekend.';
      case 'next-week':
        return 'Plan ahead with next week\'s garage sales, vintage pop-ups, and thrift events.';
      case 'this-month':
        return 'Discover all the thrifting opportunities happening this month in Dallas.';
      case 'all-upcoming':
        return 'Browse all upcoming thrift events, sales, and vintage markets in the Dallas area.';
      default:
        return 'Your curated list of garage sales, vintage pop-ups, and thrift stores.';
    }
  };
  
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
              {getDateRange()}
            </span>
            {/* Main Heading */}
            <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
              {getTitle()}
            </h1>

            {/* Subheading */}
            <p className="text-white text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {getSubtitle()}
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
