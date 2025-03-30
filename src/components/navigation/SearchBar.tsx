
import { Search, Book, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch } from "@/hooks/use-search";

export const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    setQuery,
    results,
    isLoading,
    handleSearch,
    handleKeyDown,
    navigateToSearchPage,
  } = useSearch('', 'quick');

  // Focus input when popover opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      // Small delay to ensure the popover is fully open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isSearchOpen]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleKeyDown(e)) {
      setIsSearchOpen(false);
    }
  };

  const handleClosePopover = () => {
    setIsSearchOpen(false);
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    // Focus the input after opening
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
  };

  return (
    <div className="relative w-64">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 cursor-pointer" 
            onClick={handleSearchIconClick}
          />

          <PopoverTrigger asChild>
            <div ref={triggerRef}>
              <Input
                ref={searchInputRef}
                value={query}
                onChange={handleSearch}
                onKeyDown={handleInputKeyDown}
                placeholder="Search authors or books..."
                className="pl-10 hover-lift rounded-full"
                aria-label="Search authors or books"
                role="searchbox"
                autoComplete="off"
              />
            </div>
          </PopoverTrigger>
        </div>

        <PopoverContent
          className="w-[400px] p-0 popover-content"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <Card className="divide-y max-h-[60vh]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Searching...</div>
            ) : (
              <>
                <ScrollArea className="max-h-[50vh]">
                  {results?.authors?.filter(author => author && author.id).map((author) => (
                    <Link
                      key={author.id}
                      to={`/author/profile/${author.id}`}
                      className="block p-4 hover:bg-accent"
                      onClick={handleClosePopover}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <Badge variant="secondary">Author</Badge>
                      </div>
                      <AuthorPublicProfileView
                        name={author.name || "Anonymous Author"}
                        bio={author.bio || "No bio available"}
                        imageUrl="/placeholder.svg"
                        authorId={author.id}
                      />
                    </Link>
                  ))}
                  {results?.books?.filter(book => book && book.id && book.author).map((book) => (
                    <Link
                      key={book.id}
                      to={`/qr/${book.id}`}
                      className="block p-4 hover:bg-accent"
                      onClick={handleClosePopover}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="h-4 w-4" />
                        <Badge variant="secondary">Book</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">{book.book_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          By {book.author?.name || "Anonymous Author"}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {query.trim() && !isLoading && !results?.authors?.length && !results?.books?.length && (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  )}
                  {!query.trim() && (
                    <div className="p-4 text-center text-muted-foreground">
                      Type to search...
                    </div>
                  )}
                </ScrollArea>
                {query.trim() && (
                  <div className="p-3 border-t">
                    <button
                      onClick={() => {
                        navigateToSearchPage();
                        handleClosePopover();
                      }}
                      className="w-full py-2 px-3 bg-secondary/50 hover:bg-secondary rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      View all results for "{query}"
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};
