console.log("🔥 SearchBar is rendering!");

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
import { useDebounce } from "@/hooks/use-debounce";

export const SearchBar = () => {
  const queryRef = useRef(""); // ✅ Store query without re-rendering
  const [queryDisplay, setQueryDisplay] = useState(""); // ✅ UI state for input display
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0); // ✅ Triggers `useQuery` updates
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (queryRef.current.length > 0) {
      const timer = setTimeout(() => {
        setIsSearchOpen(true);
      }, 50); // a small delay
      return () => clearTimeout(timer);
    }
  }, [searchTrigger]);
  

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  queryRef.current = e.target.value;
  setQueryDisplay(e.target.value);

  if (e.target.value.trim()) {
    setTimeout(() => setIsSearchOpen(true), 10); // ✅ Small delay to stabilize popover
  } else {
    setIsSearchOpen(false);
  }

  setSearchTrigger(prev => prev + 1);
};

  

  const handleSearchFocus = () => {
    console.log("🔍 Input focused"); // Debugging log
    setIsSearchOpen(true); // ✅ Always force the popover to stay open on focus
  };
  

  const handleResultClick = () => {
    setQueryDisplay(""); // ✅ Clears UI input
    queryRef.current = "";
    setIsSearchOpen(false);
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchTrigger], // ✅ Trigger search on state change
    queryFn: async () => {
      const currentQuery = queryRef.current.trim();
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
    enabled: searchTrigger > 0, // ✅ Ensures search only runs when needed
    retry: false
  });

  return (
    <div className="relative w-64 search-container" ref={searchInputRef}>
      <Popover open={isSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              value={queryDisplay} // ✅ Shows the latest input
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              placeholder="Search authors or books..."
              className="pl-10 hover-lift rounded-full"
              aria-label="Search authors or books"
              role="searchbox"
              autoComplete="off"
            />
          </div>
        </PopoverTrigger>
        {queryRef.current && (
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
                  {searchResults?.books?.map((book) => (
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
                  {(!searchResults?.authors?.length && !searchResults?.books?.length) && (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found for "{queryRef.current}"
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
