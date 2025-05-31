
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Rss, Globe, Zap, Mail } from "lucide-react";

interface SourceTypeFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  sourceCounts: Record<string, number>;
}

export function SourceTypeFilter({ selectedTypes, onTypesChange, sourceCounts }: SourceTypeFilterProps) {
  const sourceTypes = [
    { value: 'rss', label: 'RSS Feed', icon: Rss },
    { value: 'web_scrape', label: 'Web Scrape', icon: Globe },
    { value: 'api', label: 'API', icon: Zap },
    { value: 'email', label: 'Email Alert', icon: Mail },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Filter by Source Type</h3>
        {selectedTypes.length > 0 && selectedTypes.length < sourceTypes.length && (
          <button
            onClick={() => onTypesChange([])}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>
      
      <ToggleGroup 
        type="multiple" 
        value={selectedTypes} 
        onValueChange={onTypesChange}
        className="justify-start flex-wrap gap-2"
      >
        {sourceTypes.map((type) => {
          const Icon = type.icon;
          const count = sourceCounts[type.value] || 0;
          
          return (
            <ToggleGroupItem
              key={type.value}
              value={type.value}
              variant="outline"
              className="flex items-center gap-2 h-auto py-2 px-3"
              disabled={count === 0}
            >
              <Icon className="h-4 w-4" />
              <span>{type.label}</span>
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      
      {selectedTypes.length > 0 && (
        <div className="text-xs text-gray-500">
          Showing {selectedTypes.length} of {sourceTypes.length} source types
        </div>
      )}
    </div>
  );
}
