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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full w-full max-w-[280px]">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-16 w-16 ring-2 ring-gray-200 transition-colors">
            <AvatarImage src={avatarUrl || undefined} alt={`${name} profile picture`} className="object-cover" />
            <AvatarFallback className="text-lg font-semibold bg-gray-100 text-gray-700">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-2 w-full">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
              {name}
            </h3>
            
            <Badge variant="secondary" className="text-xs text-[#333333]">
              Joined {joinedYear}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
};
