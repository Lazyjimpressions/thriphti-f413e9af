
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";

// Sample events data organized by day
const eventsByDay = {
  friday: [
    {
      id: 1,
      title: "Friday Night Thrift Walk",
      image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "May 17",
      location: "Deep Ellum",
      tag: "NIGHT MARKET",
    },
    {
      id: 2,
      title: "Genesis Benefit Store Flash Sale",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "May 17",
      location: "North Dallas",
      tag: "FLASH SALE",
    },
  ],
  saturday: [
    {
      id: 3,
      title: "White Rock Vintage Market",
      image: "https://images.unsplash.com/photo-1563306406-e66174fa3787?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "May 18",
      location: "East Dallas",
      tag: "VINTAGE MARKET",
    },
    {
      id: 4,
      title: "Community Garage Sale",
      image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "May 18",
      location: "Plano",
      tag: "GARAGE SALE",
    },
    {
      id: 5,
      title: "Urban Flea Dallas",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "May 18",
      location: "Design District",
      tag: "FLEA MARKET",
    },
  ],
  sunday: [
    {
      id: 6,
      title: "Bishop Arts District Sale",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "May 19",
      location: "Bishop Arts",
      tag: "STREET SALE",
    },
    {
      id: 7,
      title: "Vintage Clothing Pop Up",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "May 19",
      location: "Dallas",
      tag: "VINTAGE",
    },
  ]
};

export default function EventsByDay() {
  // Get current day to set default tab
  const today = new Date().getDay();
  let defaultDay = 'saturday';
  if (today === 5) defaultDay = 'friday';
  if (today === 0) defaultDay = 'sunday';
  
  return (
    <Tabs defaultValue={defaultDay}>
      <TabsList className="mb-6">
        <TabsTrigger value="friday">Friday</TabsTrigger>
        <TabsTrigger value="saturday">Saturday</TabsTrigger>
        <TabsTrigger value="sunday">Sunday</TabsTrigger>
      </TabsList>
      
      {Object.entries(eventsByDay).map(([day, events]) => (
        <TabsContent key={day} value={day} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                title={event.title}
                image={event.image}
                date={event.date}
                location={event.location}
                tag={event.tag}
                index={index}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
