
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import { Calendar, Share } from "lucide-react";

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
  
  // For demo purposes - would be tied to real state management
  const [day, setDay] = useState(defaultDay);
  
  // Format dates for "Add to Calendar" functionality
  const getEventDate = (date: string) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = parseInt(date.split(" ")[1]);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const handleAddToCalendar = (event: any) => {
    // In a real implementation, this would integrate with calendar APIs
    console.log(`Added to calendar: ${event.title} on ${event.date}`);
    alert(`Event added to calendar: ${event.title}`);
  };
  
  const handleShareEvent = (event: any) => {
    // In a real implementation, this would use the Web Share API
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title} in ${event.location}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      console.log(`Shared event: ${event.title}`);
      alert(`Event link copied to clipboard!`);
    }
  };
  
  return (
    <Tabs defaultValue={defaultDay} onValueChange={setDay}>
      <TabsList className="mb-6">
        <TabsTrigger value="friday">Friday</TabsTrigger>
        <TabsTrigger value="saturday">Saturday</TabsTrigger>
        <TabsTrigger value="sunday">Sunday</TabsTrigger>
      </TabsList>
      
      {Object.entries(eventsByDay).map(([day, events]) => (
        <TabsContent key={day} value={day} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div key={event.id} className="h-full flex flex-col">
                <EventCard
                  title={event.title}
                  image={event.image}
                  date={event.date}
                  location={event.location}
                  tag={event.tag}
                  index={index}
                />
                
                {/* Action buttons for each event */}
                <div className="flex justify-between mt-2 px-1">
                  <button 
                    className="flex items-center gap-1 text-sm text-thriphti-green hover:text-thriphti-green/80 transition-colors"
                    onClick={() => handleAddToCalendar(event)}
                  >
                    <Calendar size={16} />
                    <span>Add to Calendar</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-1 text-sm text-thriphti-green hover:text-thriphti-green/80 transition-colors"
                    onClick={() => handleShareEvent(event)}
                  >
                    <Share size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* No events message */}
          {events.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No events found for this day.</p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
