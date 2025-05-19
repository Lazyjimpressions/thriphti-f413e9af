
import EventCard from "./EventCard";
import { motion } from "framer-motion";
import { staggerContainerVariants } from "@/lib/motion";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedEvents } from "@/integrations/supabase/queries";

export default function EventGrid() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['todaysEvents'],
    queryFn: getFeaturedEvents,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="font-serif text-4xl text-[#1C392C] mb-8">
          Today's Picks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="h-48 bg-gray-200 rounded-lg w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !events) {
    return (
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="font-serif text-4xl text-[#1C392C] mb-8">
          Today's Picks
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>Unable to load events. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Show only the first 3 events
  const displayEvents = events.slice(0, 3);

  return (
    <div className="container mx-auto px-4 md:px-8">
      <h2 className="font-serif text-4xl text-[#1C392C] mb-8">
        Today's Picks
      </h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {displayEvents.map((event, index) => (
          <EventCard 
            key={event.id}
            event={event}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}
