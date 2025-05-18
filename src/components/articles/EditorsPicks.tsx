
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import ArticleImage from "./ArticleImage";

export default function EditorsPicks() {
  // Mock data for editor's picks
  const editorsPicks = [
    {
      id: 1,
      title: "Thrift Shopping 101: How to Score the Best Deals",
      slug: "thrift-shopping-101-best-deals",
      image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tags: ["Tips", "Guide"]
    },
    {
      id: 2,
      title: "The Ultimate Guide to Vintage Shopping in Dallas",
      slug: "ultimate-guide-vintage-shopping-dallas",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tags: ["Guide", "Dallas"]
    },
    {
      id: 3,
      title: "How to Authenticate Designer Finds While Thrifting",
      slug: "authenticate-designer-finds-thrifting",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tags: ["Tips", "Authentication"]
    }
  ];
  
  return (
    <section>
      <h2 className="font-serif text-3xl text-thriphti-green mb-8">Editor's Picks</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {editorsPicks.map(pick => (
          <Link key={pick.id} to={`/articles/${pick.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-md transition-all border-thriphti-green/20">
              <div className="h-48 overflow-hidden">
                <ArticleImage 
                  src={pick.image} 
                  alt={pick.title} 
                  className="w-full h-full"
                  tags={pick.tags}
                />
              </div>
              <CardContent className="p-5">
                <CardTitle className="font-serif text-lg">{pick.title}</CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
