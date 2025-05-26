
import { useEffect, useMemo, useState } from "react";
import ArticleCard from "./ArticleCard";
import { getAllArticles } from "@/integrations/supabase/queries";
import type { Database } from '@/integrations/supabase/types';
import type { Article } from "@/types/article";
import { toast } from "@/hooks/use-toast";

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
    
    // Debug Supabase client configuration - using public methods only
    console.log("Fetching articles from Supabase");
    
    getAllArticles()
      .then((data) => {
        console.log("Articles data received:", data ? `${data.length} articles` : "No data");
        
        // Map the Supabase article data to match our Article interface
        const mappedArticles = data.map((article: SupabaseArticle): Article => ({
          ...article,
          publishedAt: article.published_at, // Map published_at to publishedAt
          source_url: article.source_url || '' // Include the source_url field
        }));
        setArticles(mappedArticles);
      })
      .catch((err) => {
        console.error("Error fetching articles:", err);
        setError(err.message);
        toast({
          title: "Error loading articles",
          description: `${err.message}. Please try refreshing the page.`,
          variant: "destructive"
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredArticles = useMemo(() => {
    if (filter === "all") {
      return articles;
    }
    
    // Log categories for debugging
    console.log("Current filter:", filter);
    console.log("Available categories:", [...new Set(articles.map(a => a.category))]);
    
    return articles.filter((article) => {
      switch (filter) {
        case "guides":
          // Use case-insensitive comparison for guides
          return article.category?.toLowerCase() === "guide" || 
                 article.tags?.some(tag => tag.toLowerCase() === "guide");
        case "tips":
          return article.category?.toLowerCase() === "tips & tricks" || 
                 article.category?.toLowerCase() === "tips";
        case "stores":
          return article.category?.toLowerCase() === "store features" ||
                 article.category?.toLowerCase() === "store feature";
        case "neighborhoods":
          return article.category?.toLowerCase() === "neighborhood spotlights" ||
                 article.category?.toLowerCase() === "neighborhood spotlight";
        case "events":
          return article.category?.toLowerCase() === "events & markets" || 
                 article.category?.toLowerCase() === "events" ||
                 article.category?.toLowerCase() === "event";
        default:
          return true;
      }
    });
  }, [filter, articles]);

  if (loading) {
    return <div className="text-center py-12">Loading articles...</div>;
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          className="bg-thriphti-green text-white px-4 py-2 rounded hover:bg-thriphti-green/90"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
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
