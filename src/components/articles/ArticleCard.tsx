
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Article } from "@/types/article";
import { ExternalLink } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  index: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      custom={index * 0.1}
    >
      <Link to={`/articles/${article.slug}`}>
        <Card className="overflow-hidden h-full hover:shadow-md transition-all">
          <AspectRatio ratio={16/9}>
            <img 
              src={article.image} 
              alt={article.title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <CardContent className="p-5">
            <Badge className="mb-3 bg-thriphti-green hover:bg-thriphti-green/90 text-white">
              {article.category}
            </Badge>
            <h3 className="font-serif text-xl mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{article.author}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            {article.source_url && (
              <div className="mt-2 flex items-center text-xs text-thriphti-green">
                <ExternalLink size={12} className="mr-1" />
                <span className="truncate">Source: {new URL(article.source_url).hostname}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
