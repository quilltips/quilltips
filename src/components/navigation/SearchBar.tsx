
import { Search, Book, User } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearch } from "@/hooks/use-search";

export const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    query,
    results,
    isLoading,
    handleSearch,
    handleKeyDown,
  } = useSearch('', 'quick');

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e);
  }, [handleSearch]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleKeyDown(e)) {
      setIsSearchOpen(false);
    }
  }, [handleKeyDown]);

  const handleClosePopover = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  return (
    <div className="relative w-64">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />

        <PopoverTrigger asChild>
          <Input
            ref={searchInputRef}
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search authors or books..."
            className="pl-10 hover-lift rounded-full"
            aria-label="Search authors or books"
            role="searchbox"
            autoComplete="off"
          />
        </PopoverTrigger>

        <PopoverContent
          className="w-[400px] p-0 popover-content"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <Card className="divide-y">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Searching...</div>
            ) : (
              <>
                {results?.authors?.map((author) => (
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
                {results?.books?.map((book) => (
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
                        By {book.author.name || "Anonymous Author"}
                      </p>
                    </div>
                  </Link>
                ))}
                {!results?.authors?.length && !results?.books?.length && query.trim() && (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{query}"
                  </div>
                )}
                {!query.trim() && (
                  <div className="p-4 text-center text-muted-foreground">
                    Type to search...
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
