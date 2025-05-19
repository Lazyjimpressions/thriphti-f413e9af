
import { useParams, Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import Layout from "@/components/layout/Layout";
import RelatedArticle from "@/components/storeDetail/RelatedArticle";
import { useEffect, useState } from 'react';
import { getArticleBySlug, getAllArticles } from '@/integrations/supabase/queries';
import type { Database } from '@/types/supabase';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Share2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ArticleImage from "@/components/articles/ArticleImage";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Database['public']['Tables']['articles']['Row'] | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Database['public']['Tables']['articles']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState("5 min");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getArticleBySlug(slug)
      .then((data) => {
        setArticle(data);
        
        // Calculate reading time based on word count (rough estimate)
        if (data?.body) {
          const words = data.body.split(/\s+/).length;
          const minutes = Math.ceil(words / 200); // Average reading speed
          setReadingTime(`${minutes} min read`);
        }
        
        // Fetch related articles by category
        return getAllArticles();
      })
      .then((all) => {
        if (article) {
          setRelatedArticles(all.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (error || !article) {
    return (
      <div className="min-h-screen bg-thriphti-ivory pt-32 flex justify-center">
        <div className="thriphti-container">
          <h1 className="font-serif text-4xl text-thriphti-green mb-4">Article not found</h1>
          <p>{error || "The article you're looking for doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{article.title} | Thriphti</title>
        <meta name="description" content={article.excerpt || ''} />
      </Helmet>
      <main>
        {/* Back to Articles Link */}
        <div className="bg-thriphti-ivory pt-8 pb-2">
          <div className="thriphti-container">
            <Link to="/articles">
              <Button variant="ghost" size="sm" className="group">
                <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={18} />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Hero Section */}
        <section className="relative bg-thriphti-green py-24">
          <div className="thriphti-container">
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 text-white/80 mb-4">
                <Badge className="bg-white/20 hover:bg-white/30 text-white">
                  {article.category}
                </Badge>
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {readingTime}
                </span>
                <span>•</span>
                <span>{article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : ''}</span>
              </div>
              <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
                {article.title}
              </h1>
              <p className="text-xl text-white/90 mb-8">
                {article.excerpt}
              </p>
              <div className="flex items-center text-white justify-between">
                <span>By {article.author}</span>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Article Content */}
        <div className="thriphti-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <motion.div
              className="lg:col-span-8"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Featured Image */}
              <div className="mb-8 rounded-lg overflow-hidden">
                <ArticleImage
                  src={article.image}
                  alt={article.title}
                  className="w-full h-auto"
                  tags={article.tags}
                  category={article.category}
                />
              </div>
              
              {/* Article Body */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-lg leading-relaxed">
                  {article.body}
                </p>
              </div>
              
              {/* Source URL if available */}
              {article.source_url && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <a 
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-thriphti-green hover:underline"
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Source: {new URL(article.source_url).hostname}
                  </a>
                </div>
              )}
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="bg-thriphti-ivory">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Sidebar */}
            <motion.div
              className="lg:col-span-4"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              custom={0.2}
            >
              <div className="bg-thriphti-ivory p-6 rounded-lg sticky top-24">
                <h3 className="font-serif text-xl text-thriphti-green mb-4">
                  More in {article.category}
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map(related => (
                    <RelatedArticle
                      key={related.id}
                      title={related.title}
                      excerpt={related.excerpt || ''}
                      image={related.image || ''}
                      link={`/articles/${related.slug}`}
                      tags={related.tags}
                      category={related.category}
                    />
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="font-serif text-xl text-thriphti-green mb-4">
                  Discover More
                </h3>
                <div className="space-y-3">
                  <Link to="/stores" className="block hover:underline text-thriphti-charcoal">
                    Explore Local Stores
                  </Link>
                  <Link to="/this-weekend" className="block hover:underline text-thriphti-charcoal">
                    This Weekend's Events
                  </Link>
                  <Link to="/guides" className="block hover:underline text-thriphti-charcoal">
                    Thrifting Guides
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* CTA Section */}
        <section className="bg-thriphti-gold/20 py-12">
          <div className="thriphti-container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl text-thriphti-green mb-4">
                Looking for more thrifting adventures?
              </h2>
              <p className="mb-6">
                Join our newsletter for weekly thrifting tips, store highlights, and upcoming events.
              </p>
              <Button className="bg-thriphti-green hover:bg-thriphti-green/90">
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
        </section>
        
        {/* Related Articles */}
        <motion.section
          className="py-12 bg-white"
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          <div className="thriphti-container">
            <h2 className="font-serif text-3xl text-thriphti-green mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <RelatedArticle
                  key={related.id}
                  title={related.title}
                  excerpt={related.excerpt || ''}
                  image={related.image || ''}
                  link={`/articles/${related.slug}`}
                  tags={related.tags}
                  category={related.category}
                />
              ))}
            </div>
          </div>
        </motion.section>
      </main>
    </Layout>
  );
}
