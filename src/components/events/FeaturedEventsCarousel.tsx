
import { useState } from "react"; 
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import EventCard from "@/components/EventCard";
import { getFeaturedEvents } from "@/integrations/supabase/queries";
import { Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TimeRange } from "@/pages/Events";

interface FeaturedEventsCarouselProps {
  timeRange: TimeRange;
}

export default function FeaturedEventsCarousel({ timeRange }: FeaturedEventsCarouselProps) {
  const navigate = useNavigate();
  
  const { data: featuredEvents, isLoading, error } = useQuery({
    queryKey: ['featuredEvents', timeRange],
    queryFn: getFeaturedEvents,
  });

  // Handle event selection - always navigate to event detail page
  const handleSelectEvent = (event: Event) => {
    // Always navigate to internal event detail page
    navigate(`/events/${event.id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-pulse flex flex-col w-full">
          <div className="h-48 bg-gray-200 rounded-lg w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !featuredEvents) {
    return (
      <div className="w-full text-center py-12 text-gray-500">
        <p>Unable to load featured events. Please try again later.</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {featuredEvents.map((event) => (
          <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <div className="h-full">
              <EventCard
                event={event}
                onSelect={handleSelectEvent}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-end gap-2 mt-6">
        <CarouselPrevious className="relative static left-auto translate-y-0" />
        <CarouselNext className="relative static right-auto translate-y-0" />
      </div>
    </Carousel>
  );
}
