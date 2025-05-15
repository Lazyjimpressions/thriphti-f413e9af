
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterBar({ selectedFilter, onFilterChange }: FilterBarProps) {
  const filters = [
    { id: 'all', label: 'All Articles' },
    { id: 'guides', label: 'Guides' },
    { id: 'tips', label: 'Tips & Tricks' },
    { id: 'stores', label: 'Store Features' },
    { id: 'neighborhoods', label: 'Neighborhood Spotlights' },
    { id: 'events', label: 'Events & Markets' }
  ];
  
  return (
    <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="thriphti-container py-4">
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {filters.map(filter => (
              <Badge 
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                  selectedFilter === filter.id 
                  ? "bg-thriphti-rust text-white hover:bg-thriphti-rust/90" 
                  : "hover:bg-gray-100"
                }`}
                onClick={() => onFilterChange(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
