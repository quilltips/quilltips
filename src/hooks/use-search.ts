
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export interface SearchResult {
  authors: any[];
  books: any[];
}

export function useSearch() {
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

  return {
    query,
    isSearchOpen,
    searchResults,
    isLoading,
    searchInputRef,
    popoverRef,
    setIsSearchOpen,
    handleSearchChange,
    handleSearchFocus,
    handleResultClick,
    handleKeyDown,
    debouncedQuery
  };
}
