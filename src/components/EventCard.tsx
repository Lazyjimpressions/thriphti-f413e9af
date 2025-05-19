
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EventCardProps {
  title: string;
  image: string;
  date: string;
  location: string;
  tag: string;
  index?: number;
}

export default function EventCard({ title, image, date, location, tag, index = 0 }: EventCardProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            delay: index * 0.1,
            duration: 0.5 
          } 
        }
      }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col border-none shadow-md hover:shadow-lg transition-shadow">
        <div className="relative w-full h-0 pb-[75%] overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-thriphti-rust text-white text-xs font-medium px-3 py-1 rounded-sm uppercase">
              {tag}
            </span>
          </div>
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-serif text-xl text-[#1C392C] line-clamp-1 font-medium" title={title}>{title}</h3>
        </CardHeader>
        <CardContent className="pb-2 text-sm space-y-2 flex-grow">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-thriphti-rust flex-shrink-0" />
            <span className="text-gray-600 line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-thriphti-rust flex-shrink-0" />
            <span className="text-gray-600">{date}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="text-[#1C392C] hover:text-thriphti-rust p-0 flex items-center gap-1 font-medium"
          >
            View Details
            <ArrowRight size={16} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
