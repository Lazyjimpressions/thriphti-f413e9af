
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";
import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { getAllArticles } from "@/integrations/supabase/queries";
import { Article } from "@/types/article";
import ArticleCard from "@/components/articles/ArticleCard";
import EmailCta from "@/components/EmailCta";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";

export default function Guides() {
  const isMobile = useIsMobile();
  
  // Fetch all articles
  const { data: articlesRaw = [], isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: getAllArticles,
  });
  
  // Map the database response to match our Article interface
  const articles = articlesRaw.map((article: any): Article => ({
    ...article,
    publishedAt: article.published_at, // Map published_at to publishedAt
  }));
  
  // Filter to only show guides
  const guideArticles = articles.filter(
    (article) => article.category?.toLowerCase() === 'guide' || 
                 article.tags?.some(tag => tag.toLowerCase() === 'guide')
  );
  
  // Handle potential errors
  if (error) {
    toast({
      title: "Error loading guides",
      description: `Failed to load guide articles. Please try again.`,
      variant: "destructive",
    });
  }

  return (
    <Layout>
      <Helmet>
        <title>Guides & Resources | Thriphti</title>
        <meta 
          name="description" 
          content="Discover our curated guides for thrifting in Dallas-Fort Worth. Find tips, tricks, and expert advice for thrift shopping."
        />
      </Helmet>
      <main>
        {/* Hero section */}
        <section className="bg-thriphti-green/10 py-12 md:py-20">
          <div className="thriphti-container">
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <h1 className="font-serif text-4xl md:text-5xl text-thriphti-green mb-6">
                Thrifting Guides
              </h1>
              <p className="text-lg md:text-xl text-thriphti-charcoal mb-8">
                Find everything you need to know about thrifting in DFW. Our expert guides 
                will help you discover hidden treasures, navigate the best stores, and make 
                the most of your thrifting adventures.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Guides grid */}
        <motion.section
          className="thriphti-container py-10 md:py-16"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="font-serif text-3xl text-thriphti-green mb-8">Browse Our Guides</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col">
                  <div className="h-48 bg-gray-200 rounded-lg w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : guideArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guideArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No guide articles found.</p>
            </div>
          )}
        </motion.section>

        {/* Email subscription */}
        <motion.div
          variants={fadeInUpVariants}
          className={`${isMobile ? "mt-16" : "mt-24"} mb-10`}
        >
          <EmailCta />
        </motion.div>
      </main>
    </Layout>
  );
}
