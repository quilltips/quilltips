import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, User } from "lucide-react";

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

  const handleResultClick = (authorId: string) => {
    if (onNavigate) onNavigate();
    setOpen(false);
    navigate(`/author/profile/${authorId}`);
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
      <SheetContent side="top" className="!p-0 max-w-full">
        <form ref={formRef} onSubmit={handleSubmit} className="p-4 bg-background">
          <Input
            ref={inputRef}
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            placeholder="Search authors or books"
            className="w-full px-3 py-2 border rounded"
            autoFocus
          />
        </form>
        <ScrollArea className="p-2 max-h-[65vh]">
          {isLoading ? (
            <div className="px-4 pb-4 text-muted-foreground">Searching...</div>
          ) : (
            <>
              {results?.authors?.map((author) => (
                <button
                  key={author.id}
                  className="w-full text-left px-4 py-2 rounded hover:bg-accent/20 flex items-center gap-2"
                  onClick={() => handleResultClick(author.id)}
                  type="button"
                >
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="font-medium text-sm truncate">{author.name || "Anonymous Author"}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[260px]">
                      {author.bio ? (author.bio.length > 60 ? author.bio.substring(0, 60) + '...' : author.bio) : "No bio available"}
                    </div>
                  </div>
                </button>
              ))}
              {query.trim() && !isLoading && !results?.authors?.length && (
                <div className="px-4 pb-4 text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
              {query.trim() && results?.authors?.length > 0 && (
                <div className="pt-3 px-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-xs text-blue-600 hover:underline"
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
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
