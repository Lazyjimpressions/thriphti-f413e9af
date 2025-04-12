
import EventCard from "./EventCard";
import { motion } from "framer-motion";
import { staggerContainerVariants } from "@/lib/motion";

// Sample event data
const events = [
  {
    id: 1,
    title: "Eastside Flea",
    image: "https://images.unsplash.com/photo-1522770179533-24471fcdba45?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 27",
    location: "Fort Worth",
    tag: "FLEA",
  },
  {
    id: 2,
    title: "Community Garage Sale",
    image: "https://images.unsplash.com/photo-1563306406-e66174fa3787?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 27",
    location: "Plano",
    tag: "GARAGE SALE",
  },
  {
    id: 3,
    title: "Vintage Clothing Pop Up",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 28",
    location: "Dallas",
    tag: "VINTAGE",
  },
  {
    id: 4,
    title: "Consignment Warehouse Sale",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 27",
    location: "Arlington",
    tag: "WAREHOUSE SALE",
  },
  {
    id: 5,
    title: "Antique Market",
    image: "https://images.unsplash.com/photo-1544601280-a716c634e3be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 29",
    location: "Garland",
    tag: "ANTIQUES",
  },
  {
    id: 6,
    title: "Charity Thrift Shop Sale",
    image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    date: "Apr. 30",
    location: "Irving",
    tag: "THRIFT",
  },
];

export default function EventGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="thriphti-container">
        <h2 className="font-serif text-3xl md:text-4xl text-thriphti-green mb-8">
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
    </section>
  );
}
