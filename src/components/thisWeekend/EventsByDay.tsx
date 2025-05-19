
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import { Calendar, Share } from "lucide-react";
import { getEventsByDay } from "@/integrations/supabase/queries";
import { Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function EventsByDay() {
  const navigate = useNavigate();
  
  // Get current weekend dates with more reliable date calculations
  const getFridayToSunday = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days to Friday (5), Saturday (6), and Sunday (0)
    let daysToFriday = 5 - currentDay;
    if (daysToFriday < 0) daysToFriday += 7; // If we're past Friday, get next week's Friday
    
    const friday = new Date();
    friday.setDate(now.getDate() + daysToFriday);
    friday.setHours(0, 0, 0, 0);
    
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
  console.log("Weekend dates:", weekendDates);
  
  // Get current day to set default tab
  const today = new Date().getDay();
  let defaultDay = 'saturday';
  if (today === 5) defaultDay = 'friday';
  if (today === 0) defaultDay = 'sunday';
  
  const [day, setDay] = useState(defaultDay);
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['eventsByDay', weekendDates],
    queryFn: () => getEventsByDay(weekendDates.friday, weekendDates.sunday),
  });

  useEffect(() => {
    if (events) {
      console.log("Fetched events:", events.length);
      
      // Debug event dates to see if there's a mismatch
      events.forEach(event => {
        const eventDate = new Date(event.event_date).toISOString().split('T')[0];
        console.log(`Event: ${event.title}, Date: ${event.event_date}, Normalized: ${eventDate}`);
      });
    }
    if (error) {
      console.error("Error fetching events:", error);
    }
  }, [events, error]);
  
  // Group events by day with improved date comparison
  const eventsByDay = {
    friday: events ? events.filter(event => {
      // Normalize both dates to account for timezone differences
      const eventDate = new Date(event.event_date).toISOString().split('T')[0];
      return eventDate === weekendDates.friday;
    }) : [],
    saturday: events ? events.filter(event => {
      const eventDate = new Date(event.event_date).toISOString().split('T')[0];
      return eventDate === weekendDates.saturday;
    }) : [],
    sunday: events ? events.filter(event => {
      const eventDate = new Date(event.event_date).toISOString().split('T')[0];
      return eventDate === weekendDates.sunday;
    }) : []
  };
  
  // Debug eventsByDay to see what's being filtered
  useEffect(() => {
    console.log("Events by day:", {
      friday: eventsByDay.friday.length,
      saturday: eventsByDay.saturday.length,
      sunday: eventsByDay.sunday.length
    });
  }, [eventsByDay]);
  
  const handleAddToCalendar = (event: Event) => {
    // Create a Google Calendar URL
    const startDate = new Date(event.event_date);
    if (event.start_time) {
      const [hours, minutes] = event.start_time.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    const endDate = new Date(startDate);
    if (event.end_time) {
      const [hours, minutes] = event.end_time.split(':');
      endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      endDate.setHours(startDate.getHours() + 2); // Default 2 hour duration
    }
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/-|:|\.\d+/g, '')}/${endDate.toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.venue ? `${event.venue}, ${event.location}` : event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
    toast({
      title: "Event Added to Calendar",
      description: `${event.title} has been added to your calendar.`
    });
  };
  
  const handleShareEvent = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title} in ${event.location}`,
        url: event.source_url || window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `${event.title} - ${event.location}${event.source_url ? ` - ${event.source_url}` : ''}`;
      
      try {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Link Copied",
          description: "Event details copied to clipboard!"
        });
      } catch (err) {
        console.error("Clipboard write failed:", err);
        toast({
          title: "Share Failed",
          description: "Unable to copy to clipboard",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle event selection
  const handleSelectEvent = (event: Event) => {
    if (event.source_url) {
      window.open(event.source_url, '_blank');
    } else {
      // Navigate to the event detail page
      navigate(`/events/${event.id}`);
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
        <p className="text-sm mt-2 text-gray-400">Error: {(error as Error).message}</p>
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
                  event={event}
                  index={index}
                  onSelect={handleSelectEvent}
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
