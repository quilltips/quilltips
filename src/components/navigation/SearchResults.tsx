
import { Link } from "react-router-dom";
import { Book, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";

interface Author {
  id: string;
  name: string;
  bio?: string;
}

interface Book {
  id: string;
  book_title: string;
  author: {
    id: string;
    name: string;
  };
}

interface SearchResultsProps {
  isLoading: boolean;
  authors: Author[];
  books: Book[];
  query: string;
  onResultClick: () => void;
}

export const SearchResults = ({
  isLoading,
  authors,
  books,
  query,
  onResultClick,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Searching...
      </div>
    );
  }

  const hasResults = authors.length > 0 || books.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No results found for "{query}"
      </div>
    );
  }

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
