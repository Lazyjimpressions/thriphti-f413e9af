
import { useEffect, useMemo, useState } from "react";
import ArticleCard from "./ArticleCard";
import { getAllArticles } from "@/integrations/supabase/queries";
import type { Database } from '@/types/supabase';
import type { Article } from "@/types/article";

// Type alias for article from Supabase
type SupabaseArticle = Database['public']['Tables']['articles']['Row'];

interface ArticleGridProps {
  filter: string;
}

export default function ArticleGrid({ filter }: ArticleGridProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllArticles()
      .then((data) => {
        // Map the Supabase article data to match our Article interface
        const mappedArticles = data.map((article: SupabaseArticle): Article => ({
          ...article,
          publishedAt: article.publishedat // Map publishedat to publishedAt
        }));
        setArticles(mappedArticles);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredArticles = useMemo(() => {
    if (filter === "all") {
      return articles;
    }
    return articles.filter((article) => {
      switch (filter) {
        case "guides":
          return article.category === "Guides";
        case "tips":
          return article.category === "Tips & Tricks";
        case "stores":
          return article.category === "Store Features";
        case "neighborhoods":
          return article.category === "Neighborhood Spotlights";
        case "events":
          return article.category === "Events & Markets";
        default:
          return true;
      }
    });
  }, [filter, articles]);

  if (loading) {
    return <div className="text-center py-12">Loading articles...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="font-serif text-3xl text-thriphti-green mb-8">Latest Articles</h2>
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No articles found for this filter.</p>
        </div>
      )}
    </div>
  );
}
