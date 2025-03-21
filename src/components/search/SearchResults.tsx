
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { AuthorSearchResults } from "./AuthorSearchResults";
import { BookSearchResults } from "./BookSearchResults";
import { SearchResult } from "@/hooks/use-search";

interface SearchResultsProps {
  searchResults: SearchResult | undefined;
  isLoading: boolean;
  query: string;
  debouncedQuery: string;
  onResultClick: () => void;
  setIsSearchOpen: (isOpen: boolean) => void;
}

export const SearchResults = ({ 
  searchResults, 
  isLoading, 
  query, 
  debouncedQuery, 
  onResultClick, 
  setIsSearchOpen
}: SearchResultsProps) => {
  return (
    <Card className="divide-y">
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          Searching...
        </div>
      ) : (
        <>
          <AuthorSearchResults 
            authors={searchResults?.authors || []} 
            onResultClick={onResultClick} 
          />
          <BookSearchResults 
            books={searchResults?.books || []} 
            onResultClick={onResultClick} 
          />
          
          {query && (!searchResults?.authors?.length && !searchResults?.books?.length) && (
            <div className="p-4 text-center text-muted-foreground">
              <p>No results found for "{query}"</p>
              <button 
                className="mt-2 text-primary hover:underline" 
                onClick={() => {
                  setIsSearchOpen(false);
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }}
              >
                See all results
              </button>
            </div>
          )}
          
          {debouncedQuery && (searchResults?.authors?.length > 0 || searchResults?.books?.length > 0) && (
            <div className="p-3 text-center border-t">
              <Link 
                to={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                className="text-primary hover:underline text-sm"
                onClick={() => setIsSearchOpen(false)}
              >
                See all results
              </Link>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
