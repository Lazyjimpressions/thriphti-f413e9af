import EventCard from "./EventCard";
import { motion } from "framer-motion";
import { staggerContainerVariants } from "@/lib/motion";

// Sample event data
const events = [
  {
    id: 1,
    title: "Community Garage Sale",
    image: "https://images.unsplash.com/photo-1563306406-e66174fa3787?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 27",
    location: "Plano",
    tag: "GARAGE SALE",
  },
  {
    id: 2,
    title: "Vintage Clothing Pop Up",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 28",
    location: "Dallas",
    tag: "VINTAGE",
  },
  {
    id: 3,
    title: "Consignment Warehouse Sale",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 27",
    location: "Arlington",
    tag: "WAREHOUSE SALE",
  }
];

export default function EventGrid() {
  return (
    <div className="container mx-auto px-4 md:px-8">
      <h2 className="font-serif text-4xl text-[#1C392C] mb-8">
        Today's Picks
      </h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {events.map((event, index) => (
          <EventCard 
            key={event.id}
            title={event.title}
            image={event.image}
            date={event.date}
            location={event.location}
            tag={event.tag}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}
