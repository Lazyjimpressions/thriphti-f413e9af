
import { useMemo } from "react";
import ArticleCard from "./ArticleCard";
import { Article } from "@/types/article";

// Mock data for articles
export const mockArticles: Article[] = [
  {
    id: "1",
    title: "The Complete Guide to Thrifting in Dallas",
    slug: "complete-guide-thrifting-dallas",
    excerpt: "Everything you need to know about the best thrift stores, hidden gems, and tips for finding amazing deals in Dallas.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Sarah Johnson",
    publishedAt: "2025-04-15T12:00:00Z",
    category: "Guides",
    tags: ["dallas", "thrifting", "beginner"],
    city: "Dallas"
  },
  {
    id: "2",
    title: "10 Hidden Thrift Stores in Fort Worth You Need to Visit",
    slug: "hidden-thrift-stores-fort-worth",
    excerpt: "Discover these lesser-known treasure troves that even locals might have missed in Fort Worth.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Michael Torres",
    publishedAt: "2025-04-10T12:00:00Z",
    category: "Store Features",
    tags: ["fort worth", "hidden gems", "stores"],
    city: "Fort Worth"
  },
  {
    id: "3",
    title: "Thrifting on a Budget: How to Find Designer Items for Less",
    slug: "thrifting-budget-designer-items",
    excerpt: "Learn how to spot valuable designer pieces while thrifting without breaking the bank.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Jessica Reed",
    publishedAt: "2025-04-05T12:00:00Z",
    category: "Tips & Tricks",
    tags: ["budget", "designer", "tips"],
    city: "Dallas"
  },
  {
    id: "4",
    title: "Upcoming Flea Markets in DFW: Spring 2025 Edition",
    slug: "flea-markets-dfw-spring-2025",
    excerpt: "Mark your calendars for these can't-miss flea market events happening throughout DFW this spring.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "David Kim",
    publishedAt: "2025-03-28T12:00:00Z",
    category: "Events & Markets",
    tags: ["events", "flea markets", "spring"],
    city: "DFW"
  },
  {
    id: "5",
    title: "Spotlight on Bishop Arts: A Thrifter's Paradise",
    slug: "spotlight-bishop-arts-thrifters-paradise",
    excerpt: "Explore the eclectic mix of thrift stores, vintage boutiques, and consignment shops in the Bishop Arts District.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Lisa Chen",
    publishedAt: "2025-03-20T12:00:00Z",
    category: "Neighborhood Spotlights",
    tags: ["bishop arts", "dallas", "neighborhoods"],
    city: "Dallas"
  },
  {
    id: "6",
    title: "The Best Time to Thrift: When to Shop for the Best Finds",
    slug: "best-time-thrift-shop-finds",
    excerpt: "Insider knowledge on when thrift stores restock and the optimal days to shop for maximum treasure hunting success.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "James Wilson",
    publishedAt: "2025-03-15T12:00:00Z",
    category: "Tips & Tricks",
    tags: ["timing", "strategy", "tips"],
    city: "DFW"
  }
];

interface ArticleGridProps {
  filter: string;
}

export default function ArticleGrid({ filter }: ArticleGridProps) {
  const filteredArticles = useMemo(() => {
    if (filter === "all") {
      return mockArticles;
    }
    
    return mockArticles.filter(article => {
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
  }, [filter]);
  
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
