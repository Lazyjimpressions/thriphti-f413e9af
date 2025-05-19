
import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import Layout from "@/components/layout/Layout";
import ThisWeekendHero from "@/components/thisWeekend/ThisWeekendHero";
import FeaturedEventsCarousel from "@/components/thisWeekend/FeaturedEventsCarousel";
import EventsByDay from "@/components/thisWeekend/EventsByDay";
import { CalendarRange, MapPin, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailCta from "@/components/EmailCta";
import ThisWeekendFilter from "@/components/thisWeekend/ThisWeekendFilter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function ThisWeekend() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  return (
    <Layout>
      <ThisWeekendHero />
      
      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Filter Section - Now with improved layout */}
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-3xl text-thriphti-green">
              Find Events
            </h2>
            
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="w-full max-w-[180px]">
              <CollapsibleTrigger 
                className="flex items-center gap-1 text-thriphti-green hover:text-thriphti-green/80 py-1 px-3 border border-thriphti-green/30 rounded-md"
              >
                <Filter size={16} className="mr-1" />
                {isFilterOpen ? (
                  <>Hide Filters <ChevronUp size={16} /></>
                ) : (
                  <>Show Filters <ChevronDown size={16} /></>
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-6">
                <ThisWeekendFilter />
              </CollapsibleContent>
            </Collapsible>
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
