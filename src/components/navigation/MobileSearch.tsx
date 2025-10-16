import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, User, Book, X } from "lucide-react";
import { useSlugGeneration } from "@/hooks/use-slug-generation";

interface MobileSearchProps {
  onNavigate?: () => void;
  onClose?: () => void;
}

export function MobileSearch({ onNavigate, onClose }: MobileSearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { generateProfileUrl, generateBookUrl } = useSlugGeneration();
  const {
    query,
    results,
    isLoading,
    handleSearch,
    handleKeyDown,
    navigateToSearchPage,
  } = useSearch("", "quick");

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isSearchOpen]);

  const handleResultClick = (path: string) => {
    if (onNavigate) onNavigate();
    if (onClose) onClose();
    navigate(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate();
    if (onClose) onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (!isSearchOpen) {
    return (
      <button
        onClick={() => setIsSearchOpen(true)}
        className="w-full px-4 py-3 text-left hover:bg-accent/10 rounded-md flex items-center gap-3"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Search authors or books</span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between px-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Search
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSearchOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <form ref={formRef} onSubmit={handleSubmit} className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            placeholder="Search authors or books"
            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-muted focus:border-[#FFD166] focus:ring-0"
            autoFocus
          />
        </div>
      </form>
      
      {/* Results */}
      {query.trim() && (
        <ScrollArea className="max-h-[40vh] px-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-pulse text-sm text-muted-foreground">Searching...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {results?.authors?.map((author) => (
                <button
                  key={`author-${author.id}`}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/20 flex items-center gap-3 transition-colors"
                  onClick={() => handleResultClick(generateProfileUrl(author.name || 'author'))}
                  type="button"
                >
                  <div className="w-6 h-6 rounded-full bg-[#19363C] text-[#FFD166] flex items-center justify-center text-xs font-semibold">
                    {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="font-medium text-sm truncate w-full">{author.name || "Anonymous Author"}</div>
                    <div className="text-xs text-muted-foreground truncate w-full">
                      {author.bio ? (author.bio.length > 40 ? author.bio.substring(0, 40) + '...' : author.bio) : "No bio available"}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">Author</Badge>
                </button>
              ))}
              {results?.books?.map((book) => (
                <button
                  key={`book-${book.id}`}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/20 flex items-center gap-3 transition-colors"
                  onClick={() => handleResultClick(generateBookUrl(book.book_title || 'book'))}
                  type="button"
                >
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
                    <Book className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="font-medium text-sm truncate w-full">{book.book_title}</div>
                    <div className="text-xs text-muted-foreground truncate w-full">
                      By {book.author?.name || "Anonymous Author"}
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs shrink-0 bg-[#19363C] text-white">Book</Badge>
                </button>
              ))}
              {query.trim() && !isLoading && !results?.authors?.length && !results?.books?.length && (
                <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                  No results found for "{query}"
                </div>
              )}
              {query.trim() && (results?.authors?.length || results?.books?.length) && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center text-xs text-primary hover:bg-primary/10 border-primary/20 rounded-lg py-2"
                    onClick={() => {
                      if (onNavigate) onNavigate();
                      if (onClose) onClose();
                      navigateToSearchPage();
                    }}
                  >
                    View all results for "{query}"
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
} 