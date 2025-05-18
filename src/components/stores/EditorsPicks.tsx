
import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import StoreCard from "./StoreCard";
import { staggerContainerVariants } from "@/lib/motion";

// Sample editor's picks data
const editorsPicks = [
  {
    id: "101", // Changed from number to string
    name: "Broadway Resale",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Arlington",
    city: "Arlington",
    tags: ["Clothing", "Home Decor"],
  },
  {
    id: "102", // Changed from number to string
    name: "Vintage Revival",
    image: "https://images.unsplash.com/photo-1567333126136-2638e2df5d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Bishop Arts",
    city: "Dallas",
    tags: ["Furniture", "Antiques"],
  },
  {
    id: "103", // Changed from number to string
    name: "Second Glance",
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Richardson",
    city: "Richardson",
    tags: ["Boutique", "Shoes"],
  },
];

export default function EditorsPicks() {
  return (
    <section className="py-12 bg-thriphti-ivory/30">
      <div className="thriphti-container">
        <div className="mb-8 flex items-center justify-center">
          <Sparkle className="text-thriphti-gold mr-2" size={24} />
          <h2 className="font-serif text-3xl md:text-4xl text-center text-thriphti-green">
            Editor's Picks
          </h2>
        </div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {editorsPicks.map((store, index) => (
            <StoreCard
              key={store.id}
              id={store.id}
              name={store.name}
              image={store.image}
              neighborhood={store.neighborhood}
              city={store.city}
              tags={store.tags}
              index={index}
              isFeatured={true}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
