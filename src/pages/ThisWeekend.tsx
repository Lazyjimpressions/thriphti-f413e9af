
import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import Layout from "@/components/layout/Layout";
import ThisWeekendHero from "@/components/thisWeekend/ThisWeekendHero";
import FeaturedEventsCarousel from "@/components/thisWeekend/FeaturedEventsCarousel";
import EventsByDay from "@/components/thisWeekend/EventsByDay";
import { CalendarRange, MapPin, Filter as FilterIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailCta from "@/components/EmailCta";
import ThisWeekendFilter from "@/components/thisWeekend/ThisWeekendFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

export default function ThisWeekend() {
  const [activeFilters, setActiveFilters] = useState<string[]>(["Vintage", "North Dallas"]);
  
  return (
    <Layout>
      <ThisWeekendHero />
      
      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Filter Section - New implementation with Sheet */}
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 className="font-serif text-3xl text-thriphti-green">
              Find Events
            </h2>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Active filters display */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mr-2">
                  {activeFilters.map(filter => (
                    <Badge 
                      key={filter}
                      variant="outline" 
                      className="bg-white border-thriphti-green/30 text-thriphti-green flex items-center gap-1 py-1 pl-3 pr-2"
                    >
                      {filter}
                      <button 
                        className="ml-1 hover:bg-thriphti-green/10 rounded-full p-0.5"
                        onClick={() => setActiveFilters(prev => prev.filter(f => f !== filter))}
                        aria-label={`Remove ${filter} filter`}
                      >
                        <span className="sr-only">Remove</span>×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Filter button with Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1 text-thriphti-green hover:text-thriphti-green/80 border-thriphti-green/30 hover:bg-thriphti-green/5"
                  >
                    <FilterIcon size={16} className="mr-1" />
                    Filters
                    {activeFilters.length > 0 && (
                      <Badge className="ml-1 bg-thriphti-green text-white h-5 min-w-5 flex items-center justify-center rounded-full p-0">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <ThisWeekendFilter 
                    activeFilters={activeFilters} 
                    setActiveFilters={setActiveFilters} 
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.div>
        
        {/* Featured Events Section */}
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h2 className="font-serif text-4xl text-thriphti-green mb-4">
            Featured Events
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mb-8">
            Hand-picked thrifting events in DFW this weekend, curated by our team of local experts.
          </p>
          
          <FeaturedEventsCarousel />
        </motion.div>
        
        {/* Events by Day Section */}
        <Tabs defaultValue="list" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-3xl text-thriphti-green">Events by Day</h2>
            <TabsList>
              <TabsTrigger value="list">
                <CalendarRange className="mr-2 h-4 w-4" /> List View
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapPin className="mr-2 h-4 w-4" /> Map View
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="mt-0">
            <EventsByDay />
          </TabsContent>
          
          <TabsContent value="map" className="mt-0">
            <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
              <p className="text-gray-500">Map view coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <EmailCta />
    </Layout>
  );
}
