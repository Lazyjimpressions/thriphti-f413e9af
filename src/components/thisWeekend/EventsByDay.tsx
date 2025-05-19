
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import { Calendar, Share } from "lucide-react";
import { getEventsByDay } from "@/integrations/supabase/queries";
import { Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";

export default function EventsByDay() {
  // Get current weekend dates
  const getFridayToSunday = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days to Friday (5), Saturday (6), and Sunday (0)
    const daysToFriday = currentDay <= 5 ? 5 - currentDay : (5 + 7) - currentDay;
    const friday = new Date(now);
    friday.setDate(now.getDate() + daysToFriday);
    
    const saturday = new Date(friday);
    saturday.setDate(friday.getDate() + 1);
    
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    
    return {
      friday: friday.toISOString().split('T')[0],
      saturday: saturday.toISOString().split('T')[0],
      sunday: sunday.toISOString().split('T')[0]
    };
  };

  const weekendDates = getFridayToSunday();
  
  // Get current day to set default tab
  const today = new Date().getDay();
  let defaultDay = 'saturday';
  if (today === 5) defaultDay = 'friday';
  if (today === 0) defaultDay = 'sunday';
  
  // For demo purposes - would be tied to real state management
  const [day, setDay] = useState(defaultDay);
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['eventsByDay', weekendDates],
    queryFn: () => getEventsByDay(weekendDates.friday, weekendDates.sunday),
  });

  // Group events by day
  const eventsByDay = {
    friday: events?.filter(event => {
      const eventDate = new Date(event.event_date).toISOString().split('T')[0];
      return eventDate === weekendDates.friday;
    }) || [],
    saturday: events?.filter(event => {
      const eventDate = new Date(event.event_date).toISOString().split('T')[0];
      return eventDate === weekendDates.saturday;
    }) || [],
    sunday: events?.filter(event => {
      const eventDate = new Date(event.event_date).toISOString().split('T')[0];
      return eventDate === weekendDates.sunday;
    }) || []
  };
  
  // Format dates for "Add to Calendar" functionality
  const getEventDate = (date: string) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = parseInt(date.split(" ")[1]);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const handleAddToCalendar = (event: any) => {
    // In a real implementation, this would integrate with calendar APIs
    console.log(`Added to calendar: ${event.title} on ${event.event_date}`);
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
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-pulse flex flex-col w-full">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-12 text-gray-500">
        <p>Unable to load events. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue={defaultDay} onValueChange={setDay}>
      <TabsList className="mb-6">
        <TabsTrigger value="friday">Friday</TabsTrigger>
        <TabsTrigger value="saturday">Saturday</TabsTrigger>
        <TabsTrigger value="sunday">Sunday</TabsTrigger>
      </TabsList>
      
      {Object.entries(eventsByDay).map(([dayKey, dayEvents]) => (
        <TabsContent key={dayKey} value={dayKey} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dayEvents.map((event, index) => (
              <div key={event.id} className="h-full flex flex-col">
                <EventCard
                  title={event.title}
                  image={event.image_url || '/placeholder.svg'}
                  date={new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  location={event.location}
                  tag={event.category}
                  index={index}
                />
                
                {/* Action buttons for each event */}
                <div className="flex justify-between mt-2 px-1">
                  <button 
                    className="flex items-center gap-1 text-xs text-thriphti-green hover:text-thriphti-green/80 transition-colors"
                    onClick={() => handleAddToCalendar(event)}
                  >
                    <Calendar size={14} />
                    <span>Add to Calendar</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-1 text-xs text-thriphti-green hover:text-thriphti-green/80 transition-colors"
                    onClick={() => handleShareEvent(event)}
                  >
                    <Share size={14} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* No events message */}
          {dayEvents.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No events found for this day.</p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
