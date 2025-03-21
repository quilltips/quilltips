
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";

interface AuthorSearchResultsProps {
  authors: any[];
  onResultClick: () => void;
}

export const AuthorSearchResults = ({ authors, onResultClick }: AuthorSearchResultsProps) => {
  if (authors.length === 0) return null;
  
  return (
    <>
      {authors.map((author) => (
        <Link 
          key={author.id} 
          to={`/author/profile/${author.id}`} 
          className="block p-4 hover:bg-accent"
          onClick={onResultClick}
        >
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <Badge variant="secondary">Author</Badge>
          </div>
          <AuthorPublicProfileView
            name={author.name || 'Anonymous Author'}
            bio={author.bio || 'No bio available'}
            imageUrl="/placeholder.svg"
            authorId={author.id}
          />
        </Link>
      ))}
    </>
  );
};
