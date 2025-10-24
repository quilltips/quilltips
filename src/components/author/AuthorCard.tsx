import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAuthorUrl } from "@/lib/url-utils";

interface AuthorCardProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  slug?: string | null;
  joinedYear: number;
}

export const AuthorCard = ({ id, name, avatarUrl, slug, joinedYear }: AuthorCardProps) => {
  const authorUrl = getAuthorUrl({ id, slug });
  
  return (
    <Link 
      to={authorUrl}
      className="block group"
    >
      <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-2 ring-border group-hover:ring-primary transition-colors">
            <AvatarImage src={avatarUrl || undefined} alt={`${name} profile picture`} />
            <AvatarFallback className="text-lg md:text-xl font-semibold bg-secondary text-secondary-foreground">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground text-base md:text-lg line-clamp-2">
              {name}
            </h3>
            
            <Badge variant="secondary" className="text-xs">
              Joined {joinedYear}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
};
