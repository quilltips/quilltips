
import { memo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { useSearch } from "@/hooks/use-search";

interface SearchResult {
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

const SearchResultItem = memo(({ result }: { result: SearchResult }) => {
  // Ensure result and result.author exist before accessing properties
  if (!result || !result.author) {
    return null;
  }

  return (
    <Link 
      key={result.id} 
      to={`/qr/${result.id}`}
      className="block transition-transform hover:scale-102"
    >
      <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          {result.cover_image ? (
            <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-md">
              <img 
                src={result.cover_image} 
                alt={result.book_title}
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
            <h3 className="text-lg font-semibold">{result.book_title}</h3>
            <Link 
              to={`/author/profile/${result.author.id}`}
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              by {result.author.name || 'Anonymous Author'}
            </Link>
            {result.publisher && (
              <p className="text-sm text-muted-foreground">
                Published by {result.publisher}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const {
    query,
    results,
    isLoading,
    handleSearch,
    handleKeyDown
  } = useSearch(initialQuery, 'full');

  useEffect(() => {
    // Focus search input on mount
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      (searchInput as HTMLInputElement).focus();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
        <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="Search books or authors..."
              className="pl-10 py-6 text-lg"
              autoFocus
            />
          </div>
        </Card>

        {isLoading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {results?.books && results.books.length > 0 && (
          <div className="space-y-4 animate-slideUp">
            {results.books.map((result) => (
              result ? <SearchResultItem key={result.id} result={result} /> : null
            ))}
          </div>
        )}

        {query && (!results?.books?.length) && !isLoading && (
          <Card className="p-6 text-center text-muted-foreground animate-fadeIn bg-white/80 backdrop-blur-sm">
            No results found for "{query}"
          </Card>
        )}
      </div>
    </div>
  );
};
