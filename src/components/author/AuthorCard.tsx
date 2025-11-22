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
  compact?: boolean;
  showFirstNameOnly?: boolean;
}

export const AuthorCard = ({ id, name, avatarUrl, slug, joinedYear, compact = false, showFirstNameOnly = false }: AuthorCardProps) => {
  const authorUrl = getAuthorUrl({ id, slug });
  const displayName = showFirstNameOnly ? name.split(' ')[0] : name;
  
  return (
    <Link 
      to={authorUrl}
      className="block group"
    >
      <div className={`bg-transparent  rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full w-full ${compact ? 'p-2 max-w-[140px]' : 'p-6 max-w-[280px]'}`}>
        <div className={`flex flex-col items-center ${compact ? 'space-y-2' : 'space-y-4'}`}>
          <Avatar className={`ring-2 ring-gray-200 transition-colors ${compact ? 'h-10 w-10' : 'h-16 w-16'}`}>
            <AvatarImage src={avatarUrl || undefined} alt={`${name} profile picture`} className="object-cover" />
            <AvatarFallback className={`font-semibold bg-gray-100 text-gray-700 ${compact ? 'text-xs' : 'text-lg'}`}>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className={`text-center w-full ${compact ? 'space-y-1' : 'space-y-2'}`}>
            <h3 className={`font-semibold text-muted-foreground line-clamp-2 leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
              {displayName}
            </h3>
            
            <Badge variant="secondary" className={`text-muted-foreground ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs'}`}>
              <span className="hidden md:inline">Joined </span>{joinedYear}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
};
