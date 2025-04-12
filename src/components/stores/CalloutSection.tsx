
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function CalloutSection() {
  return (
    <section className="py-12">
      <div className="thriphti-container">
        <motion.div 
          className="border border-thriphti-gold/30 rounded-lg py-8 px-4 bg-white text-center max-w-3xl mx-auto"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="font-serif text-2xl md:text-3xl text-thriphti-green mb-4">
            Know a great shop we missed?
          </h3>
          
          <div className="space-y-4">
            <a 
              href="#" 
              className="text-thriphti-rust text-lg font-medium hover:underline"
            >
              Submit it here
            </a>
            
            <div className="w-full h-px bg-thriphti-gold/20 my-4" />
            
            <p className="text-thriphti-charcoal/80">
              Own a shop?{" "}
              <a href="#" className="text-thriphti-green hover:underline">
                Claim your profile
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
