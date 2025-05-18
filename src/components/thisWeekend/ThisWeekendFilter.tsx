
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export default function ThisWeekendFilter() {
  // Active filters (these would be managed with state in a real app)
  const activeFilters = ["Vintage", "North Dallas"];
  
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
  
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center text-thriphti-green">
          <Filter size={18} className="mr-2" />
          <span className="font-medium">Filters</span>
        </div>
        
        {activeFilters.map(filter => (
          <Badge 
            key={filter}
            variant="outline" 
            className="bg-white border-thriphti-green/30 text-thriphti-green flex items-center gap-1 py-1.5 pl-3 pr-2"
          >
            {filter}
            <button className="ml-1 hover:bg-thriphti-green/10 rounded-full p-0.5">
              <X size={14} />
            </button>
          </Badge>
        ))}
        
        {activeFilters.length > 0 && (
          <Button 
            variant="link" 
            className="text-thriphti-green text-sm hover:text-thriphti-green/80"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterCategories.map(category => (
          <div key={category.name}>
            <h4 className="font-medium mb-2 text-thriphti-charcoal">{category.name}</h4>
            <div className="flex flex-wrap gap-2">
              {category.options.map(option => {
                const isActive = activeFilters.includes(option);
                return (
                  <Badge 
                    key={option}
                    variant={isActive ? "default" : "outline"}
                    className={`cursor-pointer ${isActive ? 'bg-thriphti-green hover:bg-thriphti-green/90' : 'hover:bg-gray-100'}`}
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
