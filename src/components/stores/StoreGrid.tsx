
import { motion } from "framer-motion";
import StoreCard from "./StoreCard";
import { staggerContainerVariants } from "@/lib/motion";

// Sample store data
const stores = [
  {
    id: 1,
    name: "Thrift Haven",
    image: "https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Lakewood",
    city: "Gayland",
    tags: ["Thrift", "Vintage"],
  },
  {
    id: 2,
    name: "Oak Cliff Emporium",
    image: "https://images.unsplash.com/photo-1617097300103-19f5413620b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Deep Ellum",
    city: "Dallas",
    tags: ["Vintage", "Furniture"],
  },
  {
    id: 3,
    name: "Uptown Consignment",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Uptown",
    city: "Dallas",
    tags: ["Women's Clothing"],
  },
  {
    id: 4,
    name: "The Rusty Find",
    image: "https://images.unsplash.com/photo-1578934191836-ff5f608c2228?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Preston Hollow",
    city: "Dallas",
    tags: ["Antiques", "Furniture"],
  },
  {
    id: 5,
    name: "Grapevine Vintage",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Grapevine",
    city: "Fort Worth",
    tags: ["Clothing", "Accessories"],
  },
  {
    id: 6,
    name: "Benefit Boutique",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    neighborhood: "Bishop Arts",
    city: "Dallas",
    tags: ["Boutique", "Home Decor"],
  },
];

export default function StoreGrid() {
  return (
    <section className="py-12">
      <div className="thriphti-container">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stores.map((store, index) => (
            <StoreCard
              key={store.id}
              id={store.id}
              name={store.name}
              image={store.image}
              neighborhood={store.neighborhood}
              city={store.city}
              tags={store.tags}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
