
console.log("🔥 SearchBar is rendering!");

import { Search, Book, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open search popover when query has content
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsSearchOpen(true);
    }
  }, [debouncedQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    
    if (e.target.value.trim() === "") {
      setIsSearchOpen(false);
    }
  };

  const handleSearchFocus = () => {
    if (query.trim().length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleResultClick = () => {
    setQuery("");
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const currentQuery = debouncedQuery.trim();
      if (!currentQuery) return { authors: [], books: [] };

      console.log("🔍 Fetching search results for:", currentQuery);

      try {
        const [authorsResponse, booksResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .ilike('name', `%${currentQuery}%`)
            .eq('role', 'author')
            .order('name')
            .limit(5),
        
          supabase
            .from('qr_codes')
            .select(`
              *,
              author:profiles(*)
            `)
            .ilike('book_title', `%${currentQuery}%`)
            .order('book_title')
            .limit(5)
        ]);

        if (authorsResponse.error) throw authorsResponse.error;
        if (booksResponse.error) throw booksResponse.error;

        return {
          authors: authorsResponse.data || [],
          books: booksResponse.data || []
        };
      } catch (error) {
        console.error('Search error:', error);
        return { authors: [], books: [] };
      }
    },
    enabled: debouncedQuery.length > 0,
    retry: false
  });

  return (
    <div className="relative w-64 search-container">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search authors or books..."
              className="pl-10 hover-lift rounded-full"
              aria-label="Search authors or books"
              role="searchbox"
              autoComplete="off"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          ref={popoverRef}
          className="w-[400px] p-0"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <Card className="divide-y">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : (
              <>
                {searchResults?.authors?.length > 0 && (
                  <>
                    {searchResults.authors.map((author) => (
                      <Link 
                        key={author.id} 
                        to={`/author/profile/${author.id}`} 
                        className="block p-4 hover:bg-accent"
                        onClick={handleResultClick}
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
                  </>
                )}
                {searchResults?.books?.length > 0 && (
                  <>
                    {searchResults.books.map((book) => (
                      <Link 
                        key={book.id} 
                        to={`/author/profile/${book.author.id}`} 
                        className="block p-4 hover:bg-accent"
                        onClick={handleResultClick}
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
                )}
                {query && (!searchResults?.authors?.length && !searchResults?.books?.length) && (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No results found for "{query}"</p>
                    <button 
                      className="mt-2 text-primary hover:underline" 
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                        setIsSearchOpen(false);
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
        </PopoverContent>
      </Popover>
    </div>
  );
};
