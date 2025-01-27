import { Search, Book, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return { authors: [], books: [] };
      
      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`)
        .eq('role', 'author')
        .order('name')
        .limit(5);

      if (authorsError) throw authorsError;

      const { data: books, error: booksError } = await supabase
        .from('qr_codes')
        .select(`
          *,
          author:profiles(*)
        `)
        .ilike('book_title', `%${query}%`)
        .order('book_title')
        .limit(5);

      if (booksError) throw booksError;

      return {
        authors: authors || [],
        books: books || []
      };
    },
    enabled: query.length > 0
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsSearchOpen(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="relative w-64" ref={searchInputRef}>
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-input"
              name="search"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Search authors or books..."
              className="pl-10 hover-lift w-full"
              aria-label="Search authors or books"
              role="searchbox"
              autoComplete="off"
            />
          </div>
        </PopoverTrigger>
        {query && (
          <PopoverContent 
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
                  {searchResults?.authors?.map((author) => (
                    <Link 
                      key={author.id} 
                      to={`/author/profile/${author.id}`} 
                      className="block p-4 hover:bg-accent"
                      onClick={() => {
                        setQuery("");
                        setIsSearchOpen(false);
                      }}
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
                  {searchResults?.books?.map((book) => (
                    <Link 
                      key={book.id} 
                      to={`/author/profile/${book.author.id}`} 
                      className="block p-4 hover:bg-accent"
                      onClick={() => {
                        setQuery("");
                        setIsSearchOpen(false);
                      }}
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
                  {(!searchResults?.authors?.length && !searchResults?.books?.length) && (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  )}
                </>
              )}
            </Card>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};