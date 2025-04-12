
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function EmailCta() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks for signing up! We've sent a confirmation link to your inbox.");
    setEmail("");
  };

  return (
    <section className="py-16 bg-thriphti-gold/20">
      <div className="thriphti-container">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-thriphti-green mb-4">
            Get the best thrift deals in DFW delivered to your inbox!
          </h2>
          <p className="text-lg mb-6">
            Join our community of local thrifters and be the first to know about sales, pop-ups, and hidden gems.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-thriphti-green/50 focus:border-thriphti-green"
            />
            <Button 
              type="submit" 
              className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white"
            >
              Sign Up
            </Button>
          </form>
          
          <p className="text-sm text-thriphti-charcoal/70 mt-4">
            We'll never spam you or share your information.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
