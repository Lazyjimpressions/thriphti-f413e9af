import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import Layout from "@/components/layout/Layout";
import RelatedArticle from "@/components/storeDetail/RelatedArticle";
import { useEffect, useState } from 'react';
import { getArticleBySlug, getAllArticles } from '@/integrations/supabase/queries';
import type { Database } from '@/types/supabase';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Database['public']['Tables']['articles']['Row'] | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Database['public']['Tables']['articles']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getArticleBySlug(slug)
      .then((data) => {
        setArticle(data);
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
                {article.category} • {article.publishedat ? new Date(article.publishedat).toLocaleDateString() : ''}
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
                src={article.image || ''}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg">
                {article.body}
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
              {/* You can add a table of contents or similar here */}
              <h3 className="font-serif text-xl text-thriphti-green mb-4">
                More in {article.category}
              </h3>
              {relatedArticles.map(related => (
                <RelatedArticle
                  key={related.id}
                  title={related.title}
                  excerpt={related.excerpt || ''}
                  image={related.image || ''}
                  link={`/articles/${related.slug}`}
                />
              ))}
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
            {relatedArticles.map((related) => (
              <RelatedArticle
                key={related.id}
                title={related.title}
                excerpt={related.excerpt || ''}
                image={related.image || ''}
                link={`/articles/${related.slug}`}
              />
            ))}
          </div>
        </motion.section>
      </main>
    </Layout>
  );
}
