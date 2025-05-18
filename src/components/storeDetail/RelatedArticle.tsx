
import { Link } from 'react-router-dom';
import ArticleImage from '@/components/articles/ArticleImage';

interface RelatedArticleProps {
  title: string;
  excerpt: string;
  image: string;
  link: string;
  tags?: string[];
}

export default function RelatedArticle({ title, excerpt, image, link, tags = [] }: RelatedArticleProps) {
  // Debug log to check tags are being passed correctly
  console.log(`RelatedArticle: ${title} - tags:`, tags);
  
  return (
    <Link to={link} className="group block">
      <div className="flex gap-3 items-center">
        <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
          <ArticleImage
            src={image}
            alt={title}
            aspectRatio="square"
            className="transition-transform group-hover:scale-105"
            tags={tags}
          />
        </div>
        <div>
          <h4 className="font-serif text-sm text-thriphti-charcoal line-clamp-2 group-hover:text-thriphti-green transition-colors">
            {title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
