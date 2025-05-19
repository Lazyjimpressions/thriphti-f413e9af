
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";

export default function ThisWeekendFilter() {
  // Filter state management (this would be connected to a real state management solution in a full implementation)
  const [activeFilters, setActiveFilters] = useState<string[]>(["Vintage", "North Dallas"]);
  
  // Available filter categories
  const filterCategories = [
    {
      name: "Event Type",
      options: ["Garage Sale", "Flea Market", "Vintage", "Consignment Sale", "Pop-Up", "Estate Sale"]
    },
    {
      name: "Neighborhood",
      options: ["North Dallas", "Downtown", "Deep Ellum", "Bishop Arts", "Oak Cliff", "Uptown", "Design District"]
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
  
  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };
  
  const clearAllFilters = () => {
    setActiveFilters([]);
  };
  
  return (
    <div className="bg-thriphti-ivory/80 rounded-lg p-6 shadow-sm border border-thriphti-gold/10">
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by event name, location, or vendor" 
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-thriphti-green focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center text-thriphti-green mr-2">
            <span className="font-medium text-sm">Active:</span>
          </div>
          
          {activeFilters.map(filter => (
            <Badge 
              key={filter}
              variant="outline" 
              className="bg-white border-thriphti-green/30 text-thriphti-green flex items-center gap-1 py-1 pl-3 pr-2 text-xs"
            >
              {filter}
              <button 
                className="ml-1 hover:bg-thriphti-green/10 rounded-full p-0.5"
                onClick={() => removeFilter(filter)}
                aria-label={`Remove ${filter} filter`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          
          {activeFilters.length > 0 && (
            <Button 
              variant="link" 
              className="text-thriphti-green text-xs hover:text-thriphti-green/80 p-0 h-auto"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
      
      {/* Filter Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filterCategories.map(category => (
          <div key={category.name}>
            <h4 className="font-medium mb-3 text-sm text-thriphti-charcoal">{category.name}</h4>
            <div className="flex flex-wrap gap-2">
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
          </div>
        ))}
      </div>
    </div>
  );
}
