
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function ArticlesHeader() {
  return (
    <section className="relative bg-thriphti-green py-24">
      <div className="thriphti-container">
        <motion.div
          variants={fadeInUpVariants} 
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
            Articles & Guides
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Our curated guides, tips, and stories about thrifting in Dallas-Fort Worth. 
            From hidden gems to expert advice, discover everything you need to know 
            about the local thrift scene.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
