
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface SearchResultProps {
  id: string;
  book_title: string;
  publisher?: string;
  cover_image?: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export const SearchResultItem = ({
  id,
  book_title,
  publisher,
  cover_image,
  author,
}: SearchResultProps) => {
  return (
    <Link 
      key={id} 
      to={`/qr/${id}`}
      className="block transition-transform hover:scale-102"
    >
      <div className="flex items-start gap-4">
        {cover_image ? (
          <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-md">
            <img 
              src={cover_image} 
              alt={book_title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-32 rounded-md flex items-center justify-center flex-shrink-0 bg-muted">
            <img 
              src="/lovable-uploads/quill_icon.png" 
              alt="Quilltips Logo"
              className="h-12 w-12 object-contain"
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">Book</Badge>
          </div>
          <h3 className="text-lg font-semibold">{book_title}</h3>
          <Link 
            to={`/author/profile/${author.id}`}
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            by {author.name || 'Anonymous Author'}
          </Link>
          {publisher && (
            <p className="text-sm text-muted-foreground">
              Published by {publisher}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
