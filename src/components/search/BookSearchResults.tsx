
import { Link } from "react-router-dom";
import { Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookSearchResultsProps {
  books: any[];
  onResultClick: () => void;
}

export const BookSearchResults = ({ books, onResultClick }: BookSearchResultsProps) => {
  if (books.length === 0) return null;
  
  return (
    <>
      {books.map((book) => (
        <Link 
          key={book.id} 
          to={`/author/profile/${book.author.id}`} 
          className="block p-4 hover:bg-accent"
          onClick={onResultClick}
        >
          <div className="flex items-center gap-2 mb-2">
            <Book className="h-4 w-4" />
            <Badge variant="secondary">Book</Badge>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">{book.book_title}</h3>
            <p className="text-sm text-muted-foreground">
              By {book.author.name || 'Anonymous Author'}
            </p>
          </div>
        </Link>
      ))}
    </>
  );
};
