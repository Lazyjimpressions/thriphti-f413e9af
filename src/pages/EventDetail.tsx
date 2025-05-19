
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEventById, filterEvents } from "@/integrations/supabase/queries"; // Added filterEvents import
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Share, ArrowLeft, ExternalLink } from "lucide-react";
import { Event } from "@/types/event";
import { toast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";
import EventCard from "@/components/EventCard";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventById(eventId!),
    enabled: !!eventId,
  });
  
  const { data: relatedEvents } = useQuery({
    queryKey: ['relatedEvents', event?.category],
    queryFn: () => filterEvents({ 
      categories: event ? [event.category] : [], 
      neighborhoods: event?.neighborhood ? [event.neighborhood] : undefined 
    }),
    enabled: !!event,
  });

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
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareUrl = window.location.href;
      const shareText = `${event.title} - ${event.location} - ${shareUrl}`;
      
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

  const formattedDate = event ? new Date(event.event_date).toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }) : '';

  const formattedTime = event && event.start_time ? 
    `${new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    })}${event.end_time ? ` - ${new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    })}` : ''}` : 'Time not specified';

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg w-full mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-serif mb-4">Event not found</h1>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/this-weekend')}>
            <ArrowLeft size={16} className="mr-2" /> Back to Events
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{event.title} | Thriphti</title>
        <meta name="description" content={event.description || `Event details for ${event.title}`} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900">
        <Button 
          variant="ghost" 
          className="absolute top-4 left-4 z-10 bg-white/80 hover:bg-white text-thriphti-green"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="mr-2" /> Back
        </Button>
        
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-80" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-thriphti-green/20 to-thriphti-rust/20"></div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end px-6 py-8">
          <div className="mb-2">
            <span className="bg-thriphti-rust text-white text-xs font-medium px-3 py-1 rounded-sm uppercase">
              {event.category}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-white">{event.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2">
            {/* Event Information Box */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-wrap gap-y-4">
                <div className="w-full md:w-1/2 flex items-start gap-3">
                  <Calendar size={20} className="text-thriphti-rust flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Date & Time</h3>
                    <p className="text-gray-600">{formattedDate}</p>
                    <p className="text-gray-600">{formattedTime}</p>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 flex items-start gap-3">
                  <MapPin size={20} className="text-thriphti-rust flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Location</h3>
                    <p className="text-gray-600">{event.venue || 'Venue not specified'}</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
                
                {event.price_range && (
                  <div className="w-full md:w-1/2 flex items-start gap-3">
                    <div className="text-thriphti-rust flex-shrink-0 mt-1">$</div>
                    <div>
                      <h3 className="font-medium text-gray-900">Price</h3>
                      <p className="text-gray-600">{event.price_range}</p>
                    </div>
                  </div>
                )}
                
                {event.neighborhood && (
                  <div className="w-full md:w-1/2 flex items-start gap-3">
                    <div className="text-thriphti-rust flex-shrink-0 mt-1">#</div>
                    <div>
                      <h3 className="font-medium text-gray-900">Neighborhood</h3>
                      <p className="text-gray-600">{event.neighborhood}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Button 
                  variant="outline"
                  className="border-thriphti-green text-thriphti-green hover:bg-thriphti-green/5"
                  onClick={() => handleAddToCalendar(event)}
                >
                  <Calendar size={16} className="mr-2" />
                  Add to Calendar
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-thriphti-green text-thriphti-green hover:bg-thriphti-green/5"
                  onClick={() => handleShareEvent(event)}
                >
                  <Share size={16} className="mr-2" />
                  Share Event
                </Button>
                
                {event.source_url && (
                  <Button
                    variant="default"
                    className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white"
                    onClick={() => window.open(event.source_url!, '_blank')}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Visit Official Page
                  </Button>
                )}
              </div>
            </div>
            
            {/* Event Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="font-serif text-2xl text-thriphti-green mb-4">About This Event</h2>
              {event.description ? (
                <div className="prose max-w-none">
                  {event.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 mb-4">{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided for this event.</p>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Related Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-serif text-xl text-thriphti-green mb-4">Similar Events</h2>
              
              {relatedEvents && relatedEvents.length > 0 ? (
                <div className="space-y-6">
                  {relatedEvents
                    .filter(related => related.id !== event.id)
                    .slice(0, 3)
                    .map((relatedEvent) => (
                      <div key={relatedEvent.id} className="group" onClick={() => navigate(`/events/${relatedEvent.id}`)}>
                        <div className="flex gap-3 cursor-pointer">
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={relatedEvent.image_url || '/placeholder.svg'} 
                              alt={relatedEvent.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-900 group-hover:text-thriphti-rust transition-colors line-clamp-2">{relatedEvent.title}</h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(relatedEvent.event_date).toLocaleDateString('en-US', {
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 mt-3 pt-1"></div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No similar events found.</p>
              )}
              
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-thriphti-green hover:text-thriphti-rust"
                onClick={() => navigate('/this-weekend')}
              >
                View All Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
