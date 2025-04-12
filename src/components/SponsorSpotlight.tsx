
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";

export default function SponsorSpotlight() {
  return (
    <section className="py-16 bg-white">
      <div className="thriphti-container">
        <h2 className="font-serif text-3xl md:text-4xl text-thriphti-green mb-8">
          Spotlight Store
        </h2>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="md:col-span-2">
            <Card className="border-none shadow-md h-full flex flex-col">
              <CardContent className="pt-6 pb-4 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-serif text-2xl text-thriphti-green">Genesis Benefit Thrift Store</h3>
                  <span className="bg-thriphti-gold/20 text-thriphti-charcoal text-xs uppercase tracking-wide font-bold py-1 px-3 rounded">
                    Local Partner
                  </span>
                </div>
                <p className="mb-4">
                  Shopping here = supporting Genesis's mission to help women & children facing family violence. Every purchase directly funds critical services.
                </p>
                <p>
                  Their new location offers twice the space and an improved selection of gently used clothing, furniture, and home goods at incredible prices.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="border-thriphti-gold text-thriphti-charcoal hover:bg-thriphti-gold/10 flex items-center gap-2"
                >
                  Visit Website
                  <ExternalLink size={16} />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card className="border-none shadow-md overflow-hidden h-full">
              <div className="h-full">
                <img 
                  src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Genesis Benefit Thrift Store" 
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
