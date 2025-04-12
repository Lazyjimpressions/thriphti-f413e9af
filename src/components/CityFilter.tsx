
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const cities = [
  "All Cities",
  "Dallas",
  "Fort Worth",
  "Plano",
  "Arlington",
  "Garland",
  "Irving",
  "Richardson",
  "Oak Cliff",
  "Lakewood"
];

export default function CityFilter() {
  const [activeCity, setActiveCity] = useState("All Cities");
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setShowScrollButtons(container.scrollWidth > container.clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount) 
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      
      setScrollPosition(newPosition);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  return (
    <section className="bg-thriphti-green py-3 sticky top-[56px] md:top-[64px] z-40 shadow-sm">
      <div className="thriphti-container relative">
        {/* Left Scroll Button */}
        {showScrollButtons && scrollPosition > 0 && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-thriphti-green p-1 rounded-full shadow-md z-10 md:hidden"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        {/* City Filter - Mobile Scrollable */}
        <div 
          ref={scrollContainerRef}
          className="md:hidden flex space-x-2 overflow-x-auto scrollbar-hide py-1 px-2"
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cities.map((city) => (
            <Button
              key={city}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCity(city)}
              className={cn(
                "text-white whitespace-nowrap rounded-full min-w-fit",
                activeCity === city 
                  ? "bg-white text-thriphti-green hover:bg-white/90 hover:text-thriphti-green" 
                  : "hover:bg-white/20 hover:text-white"
              )}
            >
              {city}
            </Button>
          ))}
        </div>
        
        {/* Right Scroll Button */}
        {showScrollButtons && scrollContainerRef.current && 
          scrollPosition < (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10) && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-thriphti-green p-1 rounded-full shadow-md z-10 md:hidden"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
        
        {/* City Filter - Desktop */}
        <div className="hidden md:flex justify-center space-x-4">
          {cities.map((city) => (
            <Button
              key={city}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCity(city)}
              className={cn(
                "text-white",
                activeCity === city 
                  ? "bg-white text-thriphti-green hover:bg-white/90 hover:text-thriphti-green" 
                  : "hover:bg-white/20 hover:text-white"
              )}
            >
              {city}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
