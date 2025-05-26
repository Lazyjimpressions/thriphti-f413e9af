
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Star, StarOff, Eye, Plus } from "lucide-react";
import type { Database } from '@/types/supabase';

type Event = Database['public']['Tables']['events']['Row'];

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (eventId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ featured: !currentFeatured })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, featured: !currentFeatured }
          : event
      ));

      toast({
        title: "Success",
        description: `Event ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`
      });
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {event.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(event.event_date).toLocaleDateString()}<br />
                    {event.start_time && (
                      <span>{event.start_time} - {event.end_time}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {event.venue && <div className="font-medium">{event.venue}</div>}
                    <div>{event.location}</div>
                    {event.neighborhood && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {event.neighborhood}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{event.category}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={event.featured ? "default" : "outline"}
                    onClick={() => toggleFeatured(event.id, event.featured || false)}
                  >
                    {event.featured ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/events/${event.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No events found. Create your first event to get started.
        </div>
      )}
    </div>
  );
}
