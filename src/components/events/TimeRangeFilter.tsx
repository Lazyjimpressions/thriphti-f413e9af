
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { TimeRange } from "@/pages/Events";

interface TimeRangeFilterProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

export default function TimeRangeFilter({ timeRange, onTimeRangeChange }: TimeRangeFilterProps) {
  const timeRangeOptions = [
    { value: 'this-weekend' as TimeRange, label: 'This Weekend', icon: Calendar },
    { value: 'next-week' as TimeRange, label: 'Next Week', icon: Calendar },
    { value: 'this-month' as TimeRange, label: 'This Month', icon: Calendar },
    { value: 'all-upcoming' as TimeRange, label: 'All Upcoming', icon: Clock }
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {timeRangeOptions.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={timeRange === value ? "default" : "outline"}
          onClick={() => onTimeRangeChange(value)}
          className={`flex items-center gap-2 ${
            timeRange === value 
              ? 'bg-thriphti-green hover:bg-thriphti-green/90 text-white' 
              : 'text-thriphti-green hover:bg-thriphti-green/5 border-thriphti-green/30'
          }`}
        >
          <Icon size={16} />
          {label}
        </Button>
      ))}
    </div>
  );
}
