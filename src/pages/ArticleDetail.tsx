
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import Footer from "@/components/Footer";
import { mockArticles } from "@/components/articles/ArticleGrid";
import RelatedArticle from "@/components/storeDetail/RelatedArticle";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  // In a real app, you would fetch the article from the API
  // For now, we'll use mock data
  const article = mockArticles.find(article => article.slug === slug);
  
  if (!article) {
    return (
      <div className="min-h-screen bg-thriphti-ivory pt-32 flex justify-center">
        <div className="thriphti-container">
          <h1 className="font-serif text-4xl text-thriphti-green mb-4">Article not found</h1>
          <p>The article you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Mock related articles
  const relatedArticles = mockArticles
    .filter(a => a.id !== article.id)
    .slice(0, 3);
  
  return (
    <>
      <Helmet>
        <title>{article.title} | Thriphti</title>
        <meta 
          name="description" 
          content={article.excerpt}
        />
      </Helmet>
      
      <div className="min-h-screen bg-thriphti-ivory">
        <main className="pt-16">
          {/* Hero Section */}
          <section className="relative bg-thriphti-green py-24">
            <div className="thriphti-container">
              <motion.div
                variants={fadeInUpVariants} 
                initial="hidden"
                animate="visible"
                className="max-w-3xl"
              >
                <div className="text-white/80 mb-4">
                  {article.category} • {new Date(article.publishedAt).toLocaleDateString()}
                </div>
                <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
                  {article.title}
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-white">
                  <span>By {article.author}</span>
                </div>
              </motion.div>
            </div>
          </section>
          
          {/* Article Content */}
          <section className="thriphti-container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <motion.div 
                className="lg:col-span-8"
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Featured Image */}
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-auto"
                  />
                </div>
                
                {/* Article Body */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg">
                    {article.body}
                  </p>
                  
                  {/* Mock content for the article */}
                  <h2>Finding Your Thrifting Style</h2>
                  <p>
                    Thrifting is not just about finding good deals; it's about developing your own personal style through secondhand treasures. Whether you're looking for vintage fashion, unique home decor, or rare collectibles, Dallas-Fort Worth's thrift scene has something for everyone.
                  </p>
                  
                  <h2>Best Times to Shop</h2>
                  <p>
                    Most thrift stores restock throughout the week, but many shoppers report finding the best selection early in the week after weekend donations have been processed. Weekday mornings tend to be less crowded, giving you more time to carefully search through the racks.
                  </p>
                  
                  <h2>Must-Visit Neighborhoods</h2>
                  <p>
                    The Bishop Arts District in Dallas and the Near Southside in Fort Worth are hotspots for curated vintage and consignment shops. For traditional thrift stores with lower prices, check out the shops along Northwest Highway and Irving Boulevard.
                  </p>
                </div>
              </motion.div>
              
              {/* Sidebar */}
              <motion.div 
                className="lg:col-span-4"
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                custom={0.2}
              >
                <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                  <h3 className="font-serif text-xl text-thriphti-green mb-4">
                    In This Article
                  </h3>
                  
                  <ul className="space-y-2 mb-8">
                    <li className="border-b border-gray-100 pb-2">
                      <a href="#" className="text-thriphti-rust hover:underline">Finding Your Thrifting Style</a>
                    </li>
                    <li className="border-b border-gray-100 pb-2">
                      <a href="#" className="text-thriphti-rust hover:underline">Best Times to Shop</a>
                    </li>
                    <li className="border-b border-gray-100 pb-2">
                      <a href="#" className="text-thriphti-rust hover:underline">Must-Visit Neighborhoods</a>
                    </li>
                  </ul>
                  
                  <h3 className="font-serif text-xl text-thriphti-green mb-4">
                    More in {article.category}
                  </h3>
                  
                  <div className="space-y-4">
                    {mockArticles
                      .filter(a => a.category === article.category && a.id !== article.id)
                      .slice(0, 3)
                      .map(related => (
                        <a 
                          key={related.id} 
                          href={`/articles/${related.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={related.image} 
                              alt={related.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <span className="text-sm group-hover:text-thriphti-rust transition-colors">
                            {related.title}
                          </span>
                        </a>
                      ))}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Related Articles */}
            <motion.section
              className="mt-16"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              custom={0.4}
            >
              <h2 className="font-serif text-3xl text-thriphti-green mb-8">You May Also Like</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((article) => (
                  <RelatedArticle
                    key={article.id}
                    title={article.title}
                    excerpt={article.excerpt}
                    image={article.image}
                    link={`/articles/${article.slug}`}
                  />
                ))}
              </div>
            </motion.section>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
