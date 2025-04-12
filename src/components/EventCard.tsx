
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
        <div className="relative aspect-[4/3]">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="tag">{tag}</span>
          </div>
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-serif text-xl text-thriphti-green">{title}</h3>
        </CardHeader>
        <CardContent className="pb-2 text-sm space-y-2 flex-grow">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-thriphti-rust" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-thriphti-rust" />
            <span>{date}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="text-thriphti-green hover:text-thriphti-rust p-0 flex items-center gap-1">
            View Details
            <ArrowRight size={16} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
