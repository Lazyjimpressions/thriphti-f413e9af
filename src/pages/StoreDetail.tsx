import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, Bookmark, Facebook, Instagram, ExternalLink } from "lucide-react";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StoreHeader from "@/components/storeDetail/StoreHeader";
import StoreInfoPanel from "@/components/storeDetail/StoreInfoPanel";
import ReviewCard from "@/components/storeDetail/ReviewCard";
import RelatedArticle from "@/components/storeDetail/RelatedArticle";

export default function StoreDetail() {
  // Mock data for the store detail
  const storeData = {
    name: "Uptown Consignment",
    subtitle: "Thrift Store",
    description: "Uptown Consignment offers a curated selection of gently used clothing, accessories, and home goods. Known for their meticulous selection process, you'll find high-quality items at a fraction of retail prices. The boutique atmosphere makes treasure hunting both enjoyable and rewarding.",
    website: "uptownconsignment.com",
    address: "1901 Abrams Pkwy, Dallas, TX 75214",
    neighborhood: "Lakewood",
    phone: "(214) 555-7890",
    hours: [
      { day: "Monday", hours: "10:00 AM - 6:00 PM" },
      { day: "Tuesday", hours: "10:00 AM - 6:00 PM" },
      { day: "Wednesday", hours: "10:00 AM - 6:00 PM" },
      { day: "Thursday", hours: "10:00 AM - 7:00 PM" },
      { day: "Friday", hours: "10:00 AM - 7:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    categories: ["Women's Clothing", "Men's Clothing", "Home Decor", "Accessories"],
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    reviews: [
      {
        id: 1,
        user: "Sarah K.",
        avatar: "",
        rating: 5,
        text: "Friendly staff and great prices! Found some brand new items with tags. Will definitely be coming back soon for more treasures.",
        date: "April 8, 2025"
      },
      {
        id: 2,
        user: "Michael T.",
        avatar: "",
        rating: 4,
        text: "Wonderful selection of high-end clothing at reasonable prices. The store is well-organized and clean. I appreciate that they carefully curate their inventory.",
        date: "March 22, 2025"
      },
      {
        id: 3,
        user: "Jessica R.",
        avatar: "",
        rating: 5,
        text: "I've been shopping here for years and always find something unique. The staff remembers regulars and offers personalized recommendations.",
        date: "February 15, 2025"
      }
    ],
    relatedArticles: [
      {
        id: 1,
        title: "The Best Thrift Deals In Dallas Right Now",
        excerpt: "Our guide to the standout sales happening at any given moment.",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        link: "#"
      },
      {
        id: 2,
        title: "How To Thrift Like A Pro",
        excerpt: "Tips for finding the best treasures at flea markets, vintage shops, and more.",
        image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        link: "#"
      },
      {
        id: 3,
        title: "Where To Go Thrifting In Fort Worth",
        excerpt: "14 stores that prove one person's trash is another person's treasure.",
        image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        link: "#"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{storeData.name} | Thriphti</title>
        <meta 
          name="description" 
          content={`Discover ${storeData.name} - ${storeData.description.substring(0, 150)}...`}
        />
      </Helmet>
      
      <div className="min-h-screen bg-thriphti-ivory">
        <main className="pt-16">
          <StoreHeader 
            name={storeData.name}
            subtitle={storeData.subtitle}
            image={storeData.image}
          />
          
          <div className="thriphti-container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <motion.div 
                className="lg:col-span-2"
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="sr-only">Store Description</h2>
                <p className="text-lg text-thriphti-charcoal mb-6">
                  {storeData.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {storeData.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="bg-thriphti-ivory border-thriphti-green text-thriphti-green hover:bg-thriphti-green/10">
                      {category}
                    </Badge>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
              >
                <StoreInfoPanel 
                  website={storeData.website}
                  address={storeData.address}
                  neighborhood={storeData.neighborhood}
                  phone={storeData.phone}
                  hours={storeData.hours}
                />
              </motion.div>
            </div>
            
            {/* Reviews Section */}
            <motion.section 
              className="mb-16"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-3xl text-thriphti-green">Reviews</h2>
                <Button className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white">
                  Write a Review
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeData.reviews.map((review) => (
                  <ReviewCard 
                    key={review.id}
                    user={review.user}
                    avatar={review.avatar}
                    rating={review.rating}
                    text={review.text}
                    date={review.date}
                  />
                ))}
              </div>
            </motion.section>
            
            {/* Related Articles */}
            <motion.section
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-3xl text-thriphti-green mb-8">Latest Articles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeData.relatedArticles.map((article) => (
                  <RelatedArticle
                    key={article.id}
                    title={article.title}
                    excerpt={article.excerpt}
                    image={article.image}
                    link={article.link}
                  />
                ))}
              </div>
            </motion.section>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
