
import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Sample data for dropdown options
const cities = ["Dallas–Fort Worth", "Dallas", "Fort Worth", "Plano", "Arlington", "Irving", "Garland"];

const neighborhoods = [
  "All Neighborhoods",
  "Bishop Arts",
  "Deep Ellum",
  "Uptown",
  "Lakewood",
  "Oak Cliff",
  "Gaylland",
  "Richardson",
  "Arlington",
];

const storeTypes = [
  "All Stores",
  "Thrift",
  "Vintage",
  "Consignment",
  "Boutique",
  "Furniture",
  "Clothing",
  "Home Decor",
];

export default function FilterBar() {
  const [isOpenNow, setIsOpenNow] = useState(false);

  return (
    <section className="py-8">
      <div className="thriphti-container">
        <div className="bg-thriphti-ivory/80 border border-thriphti-gold/20 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* City Select */}
            <div>
              <Select defaultValue={cities[0]}>
                <SelectTrigger className="w-full border-thriphti-green/20 focus:ring-thriphti-green">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-thriphti-green" />
                    <SelectValue placeholder="Select city" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Neighborhood Select */}
            <div>
              <Select defaultValue={neighborhoods[0]}>
                <SelectTrigger className="w-full border-thriphti-green/20 focus:ring-thriphti-green">
                  <SelectValue placeholder="Select neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Store Type Select */}
              <div className="flex-1">
                <Select defaultValue={storeTypes[0]}>
                  <SelectTrigger className="w-full border-thriphti-green/20 focus:ring-thriphti-green">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Open Now Toggle */}
              <div className="flex items-center space-x-2 ml-4">
                <Label htmlFor="open-now" className="text-sm font-medium whitespace-nowrap">
                  Open Now
                </Label>
                <Switch
                  id="open-now"
                  checked={isOpenNow}
                  onCheckedChange={setIsOpenNow}
                  className="data-[state=checked]:bg-thriphti-green"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
