import HeroSection from "@/components/HeroSection";
import EventGrid from "@/components/EventGrid";
import Layout from "@/components/layout/Layout";
import EditorsPick from "@/components/EditorsPick";
import SponsorSpotlight from "@/components/SponsorSpotlight";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Filter, MapPin, Calendar } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      
      {/* Upcoming Events Section */}
      <section className="bg-white py-16">
        <div className="thriphti-container">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="font-serif text-3xl md:text-4xl text-thriphti-green mb-4 md:mb-0">
                Upcoming Events
              </h2>
              <div className="flex gap-4">
                <Button variant="outline" className="border-thriphti-green/20 text-thriphti-green hover:bg-thriphti-green/10">
                  <Filter size={18} className="mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-thriphti-green/20 text-thriphti-green hover:bg-thriphti-green/10">
                  <MapPin size={18} className="mr-2" />
                  By Neighborhood
                </Button>
              </div>
            </div>
            <EventGrid />
            <div className="mt-8 text-center">
              <Button className="bg-thriphti-green hover:bg-thriphti-green/90 text-white">
                View All Events
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Editor's Pick Section */}
      <EditorsPick />

      {/* Sponsor Spotlight */}
      <SponsorSpotlight />

      {/* Neighborhood Guide Section */}
      <section className="bg-thriphti-ivory py-16">
        <div className="thriphti-container">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-thriphti-green mb-8 text-center">
              Explore by Neighborhood
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Deep Ellum', 'Bishop Arts', 'Uptown', 'Oak Cliff', 'Design District', 'Trinity Groves'].map((neighborhood) => (
                <motion.div
                  key={neighborhood}
                  className="group relative overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={`/images/neighborhoods/${neighborhood.toLowerCase().replace(' ', '-')}.jpg`}
                    alt={neighborhood}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-serif text-2xl mb-2">{neighborhood}</h3>
                    <p className="text-sm opacity-90">Discover local thrift spots</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white py-16">
        <div className="thriphti-container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-thriphti-ivory rounded-2xl p-8 md:p-12">
              <h2 className="font-serif text-3xl md:text-4xl text-thriphti-green mb-4">
                Never Miss a Deal
              </h2>
              <p className="text-lg text-thriphti-charcoal/80 mb-8">
                Get weekly updates on the best thrift finds, garage sales, and vintage pop-ups in Dallas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-thriphti-green/20 focus:outline-none focus:ring-2 focus:ring-thriphti-green/50"
                />
                <Button className="bg-thriphti-green hover:bg-thriphti-green/90 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
