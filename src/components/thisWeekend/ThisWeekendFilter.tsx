
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, Calendar } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { SheetClose, SheetTitle } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface ThisWeekendFilterProps {
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
}

export default function ThisWeekendFilter({ activeFilters, setActiveFilters }: ThisWeekendFilterProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  // Available filter categories
  const filterCategories = [
    {
      id: "eventType",
      name: "Event Type",
      options: ["Garage Sale", "Flea Market", "Vintage", "Consignment Sale", "Pop-Up", "Estate Sale"]
    },
    {
      id: "neighborhood",
      name: "Neighborhood",
      options: ["North Dallas", "Downtown", "Deep Ellum", "Bishop Arts", "Oak Cliff", "Uptown", "Design District"]
    },
    {
      id: "price",
      name: "Price Range",
      options: ["Free Entry", "$1-5 Entry", "$5-10 Entry", "$10+ Entry"]
    }
  ];
  
  // Handler functions for filter actions
  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };
  
  const clearAllFilters = () => {
    setActiveFilters([]);
    setDate(undefined);
    setSearchQuery("");
  };

  return (
    <div className="h-full flex flex-col">
      <SheetTitle className="text-xl font-serif mb-4">Filter Events</SheetTitle>
      
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event name, location, or vendor" 
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-thriphti-green focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Date Selection */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-sm text-thriphti-charcoal">Date</h4>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={`w-full justify-start text-left font-normal ${!date ? 'text-muted-foreground' : ''}`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {date ? date.toLocaleDateString() : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Filter Categories using Accordion */}
      <Accordion type="multiple" className="w-full" defaultValue={filterCategories.map(cat => cat.id)}>
        {filterCategories.map(category => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="text-sm font-medium py-3">
              {category.name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 py-2">
                {category.options.map(option => {
                  const isActive = activeFilters.includes(option);
                  return (
                    <Badge 
                      key={option}
                      variant={isActive ? "default" : "outline"}
                      className={`cursor-pointer text-xs hover:scale-105 transition-transform ${
                        isActive 
                          ? 'bg-thriphti-green hover:bg-thriphti-green/90' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleFilter(option)}
                    >
                      {option}
                    </Badge>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Action Buttons */}
      <div className="mt-auto pt-6 flex justify-between border-t border-gray-100">
        <Button 
          variant="outline" 
          className="text-thriphti-green hover:text-thriphti-green/80"
          onClick={clearAllFilters}
          disabled={activeFilters.length === 0 && !date && !searchQuery}
        >
          Clear All
        </Button>
        <SheetClose asChild>
          <Button className="bg-thriphti-green hover:bg-thriphti-green/90">
            Apply Filters
          </Button>
        </SheetClose>
      </div>
    </div>
  );
}
