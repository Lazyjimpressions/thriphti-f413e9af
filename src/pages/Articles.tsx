
import { Helmet } from "react-helmet";
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";
import Footer from "@/components/Footer";
import ArticlesHeader from "@/components/articles/ArticlesHeader";
import FilterBar from "@/components/articles/FilterBar";
import ArticleGrid from "@/components/articles/ArticleGrid";
import EditorsPicks from "@/components/articles/EditorsPicks";
import EmailCta from "@/components/EmailCta";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Articles() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const isMobile = useIsMobile();

  return (
    <>
      <Helmet>
        <title>Articles & Guides | Thriphti</title>
        <meta 
          name="description" 
          content="Discover our curated guides, tips, and stories about thrifting in the Dallas-Fort Worth metroplex."
        />
      </Helmet>
      
      <div className="min-h-screen bg-thriphti-ivory">
        <main className="pt-16">
          <ArticlesHeader />
          <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
          
          <motion.div 
            className={`thriphti-container py-8 ${isMobile ? "px-4" : "py-12"}`}
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <ArticleGrid filter={selectedFilter} />
            
            <motion.div
              variants={fadeInUpVariants}
              className={`${isMobile ? "mt-10" : "mt-16"}`}
            >
              <EditorsPicks />
            </motion.div>
            
            <motion.div
              variants={fadeInUpVariants}
              className={`${isMobile ? "mt-16" : "mt-24"}`}
            >
              <EmailCta />
            </motion.div>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
