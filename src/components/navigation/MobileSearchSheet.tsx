
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, User, Book } from "lucide-react";

interface MobileSearchSheetProps {
  onNavigate?: () => void;
}

export function MobileSearchSheet({ onNavigate }: MobileSearchSheetProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const {
    query,
    results,
    isLoading,
    handleSearch,
    handleKeyDown,
    navigateToSearchPage,
  } = useSearch("", "quick");

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [open]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (onNavigate) onNavigate();
        setOpen(false);
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    };

    form.addEventListener("keydown", handleKey);
    return () => form.removeEventListener("keydown", handleKey);
  }, [query, results, navigate, onNavigate]);

  const handleResultClick = (path: string) => {
    if (onNavigate) onNavigate();
    setOpen(false);
    navigate(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onNavigate) onNavigate();
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent/10 p-2"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="!p-0 max-w-full h-auto">
        {/* Search Input */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="Search authors or books"
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-muted focus:border-[#FFD166] focus:ring-0 text-base"
              autoFocus
            />
          </div>
        </form>
        
        {/* Results */}
        <ScrollArea className="px-2 max-h-[60vh]">
          {isLoading ? (
            <div className="px-4 pb-4 text-center py-6">
              <div className="animate-pulse">Searching...</div>
            </div>
          ) : (
            <div className="px-2 pb-4">
              {results?.authors?.map((author) => (
                <button
                  key={`author-${author.id}`}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent/20 flex items-center gap-3 transition-colors"
                  onClick={() => handleResultClick(`/author/profile/${author.id}`)}
                  type="button"
                >
                  <div className="w-8 h-8 rounded-full bg-[#19363C] text-[#FFD166] flex items-center justify-center text-sm font-semibold">
                    {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <div className="font-medium text-sm truncate w-full">{author.name || "Anonymous Author"}</div>
                    <div className="text-xs text-muted-foreground truncate w-full">
                      {author.bio ? (author.bio.length > 60 ? author.bio.substring(0, 60) + '...' : author.bio) : "No bio available"}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">Author</Badge>
                </button>
              ))}
              {results?.books?.map((book) => (
                <button
                  key={`book-${book.id}`}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent/20 flex items-center gap-3 transition-colors"
                  onClick={() => handleResultClick(`/qr/${book.id}`)}
                  type="button"
                >
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                    <Book className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <div className="font-medium text-sm truncate w-full">{book.book_title}</div>
                    <div className="text-xs text-muted-foreground truncate w-full">
                      By {book.author?.name || "Anonymous Author"}
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs shrink-0 bg-[#19363C] text-white">Book</Badge>
                </button>
              ))}
              {query.trim() && !isLoading && !results?.authors?.length && !results?.books?.length && (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
              {query.trim() && (results?.authors?.length || results?.books?.length) && (
                <div className="pt-4 px-4">
                  <Button
                    variant="outline"
                    className="w-full justify-center text-sm text-primary hover:bg-primary/10 border-primary/20 rounded-lg py-2"
                    onClick={() => {
                      setOpen(false);
                      if (onNavigate) onNavigate();
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
      </SheetContent>
    </Sheet>
  );
}
