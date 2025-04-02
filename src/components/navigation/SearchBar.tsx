
import { Search, Book, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch } from "@/hooks/use-search";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
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
                      className="block p-2 hover:bg-accent"
                      onClick={handleClosePopover}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <Badge variant="secondary" className="text-xs py-0 px-1.5">Author</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate">{author.name || "Anonymous Author"}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {author.bio ? (author.bio.length > 60 ? author.bio.substring(0, 60) + '...' : author.bio) : "No bio available"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {results?.books?.filter(book => book && book.id && book.author).map((book) => (
                    <Link
                      key={book.id}
                      to={`/qr/${book.id}`}
                      className="block p-2 hover:bg-accent"
                      onClick={handleClosePopover}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Book className="h-3 w-3" />
                        <Badge variant="default" className="text-xs py-0 px-1.5 bg-[#19363C] text-white">Book</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <img 
                            src="/lovable-uploads/quill_icon.png" 
                            alt="Book cover" 
                            className="h-4 w-4 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate">{book.book_title}</p>
                          <p className="text-xs text-muted-foreground">
                            By <Link 
                                to={`/author/profile/${book.author?.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClosePopover();
                                }}
                                className="hover:underline"
                              >
                                {book.author?.name || "Anonymous Author"}
                              </Link>
                          </p>
                        </div>
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
                  <div className="p-2 border-t">
                    <button
                      onClick={() => {
                        navigateToSearchPage();
                        handleClosePopover();
                      }}
                      className="w-full py-1.5 px-3 bg-secondary/50 hover:bg-secondary rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-colors"
                    >
                      <Search className="h-3 w-3" />
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
