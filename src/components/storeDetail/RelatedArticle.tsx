
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { fadeInUpVariants } from "@/lib/motion";

interface RelatedArticleProps {
  title: string;
  excerpt: string;
  image: string;
  link: string;
}

export default function RelatedArticle({ title, excerpt, image, link }: RelatedArticleProps) {
  return (
    <motion.div variants={fadeInUpVariants}>
      <Card className="overflow-hidden h-full flex flex-col">
        <a href={link} className="block overflow-hidden h-48">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </a>
        <CardContent className="pt-6 flex-grow">
          <a href={link} className="hover:text-thriphti-rust">
            <h3 className="font-serif text-xl mb-2 text-thriphti-charcoal font-bold">
              {title}
            </h3>
          </a>
          <p className="text-thriphti-charcoal/80">{excerpt}</p>
        </CardContent>
        <CardFooter>
          <a 
            href={link} 
            className="text-thriphti-rust hover:text-thriphti-green transition-colors"
          >
            Read More
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
