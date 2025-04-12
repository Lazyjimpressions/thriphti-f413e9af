
import { ExternalLink, MapPin, Clock, Phone, Facebook, Instagram } from "lucide-react";

interface StoreInfoPanelProps {
  website: string;
  address: string;
  neighborhood: string;
  phone: string;
  hours: { day: string, hours: string }[];
}

export default function StoreInfoPanel({ 
  website, 
  address, 
  neighborhood, 
  phone, 
  hours 
}: StoreInfoPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Website */}
      <div className="mb-6">
        <h3 className="text-thriphti-charcoal font-bold uppercase text-sm tracking-wider mb-2">
          Website
        </h3>
        <a 
          href={`https://${website}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-thriphti-green hover:text-thriphti-rust flex items-center"
        >
          {website}
          <ExternalLink size={14} className="ml-1" />
        </a>
      </div>
      
      {/* Location */}
      <div className="mb-6">
        <h3 className="text-thriphti-charcoal font-bold uppercase text-sm tracking-wider mb-2">
          {neighborhood}
        </h3>
        <p className="flex items-start">
          <MapPin size={18} className="text-thriphti-green mr-2 mt-1 flex-shrink-0" />
          <span>{address}</span>
        </p>
      </div>
      
      {/* Phone */}
      <div className="mb-6">
        <h3 className="text-thriphti-charcoal font-bold uppercase text-sm tracking-wider mb-2">
          Phone
        </h3>
        <p className="flex items-center">
          <Phone size={18} className="text-thriphti-green mr-2" />
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:text-thriphti-rust">
            {phone}
          </a>
        </p>
      </div>
      
      {/* Hours */}
      <div>
        <h3 className="text-thriphti-charcoal font-bold uppercase text-sm tracking-wider mb-2">
          Hours of Operation
        </h3>
        <div className="flex items-start">
          <Clock size={18} className="text-thriphti-green mr-2 mt-1 flex-shrink-0" />
          <div className="flex-grow">
            {hours.map((day, index) => (
              <div key={index} className="flex justify-between mb-1 last:mb-0">
                <span className="font-medium mr-4 w-24">{day.day}</span>
                <span className="text-thriphti-charcoal/80">{day.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Social Media */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex space-x-4">
          <a 
            href="#" 
            className="bg-thriphti-green/10 hover:bg-thriphti-green/20 p-2 rounded-full transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={18} className="text-thriphti-green" />
          </a>
          <a 
            href="#" 
            className="bg-thriphti-green/10 hover:bg-thriphti-green/20 p-2 rounded-full transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={18} className="text-thriphti-green" />
          </a>
        </div>
      </div>
    </div>
  );
}
