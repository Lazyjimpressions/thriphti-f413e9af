
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { fadeInUpVariants } from "@/lib/motion";

interface ReviewCardProps {
  user: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export default function ReviewCard({ user, avatar, rating, text, date }: ReviewCardProps) {
  return (
    <motion.div variants={fadeInUpVariants}>
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={avatar} alt={user} />
              <AvatarFallback className="bg-thriphti-green text-thriphti-ivory">
                {user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user}</p>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < rating ? "fill-thriphti-gold text-thriphti-gold" : "text-gray-300"} 
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-thriphti-charcoal/90">{text}</p>
        </CardContent>
        <CardFooter className="text-sm text-thriphti-charcoal/60">
          {date}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
