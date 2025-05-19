
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import EventCard from "@/components/EventCard";

// Updated featured events data with consistent, higher quality images
const featuredEvents = [
  {
    id: 1,
    title: "White Rock Vintage Market",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "May 18",
    location: "East Dallas",
    tag: "VINTAGE MARKET",
  },
  {
    id: 2,
    title: "Bishop Arts District Sale",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "May 19",
    location: "Bishop Arts",
    tag: "STREET SALE",
  },
  {
    id: 3,
    title: "Community Garage Sale",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "May 18",
    location: "Plano",
    tag: "GARAGE SALE",
  },
  {
    id: 4,
    title: "Vintage Clothing Pop Up",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "May 19",
    location: "Dallas",
    tag: "VINTAGE",
  },
];

export default function FeaturedEventsCarousel() {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {featuredEvents.map((event, index) => (
          <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <div className="h-full">
              <EventCard
                title={event.title}
                image={event.image}
                date={event.date}
                location={event.location}
                tag={event.tag}
                index={index}
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
