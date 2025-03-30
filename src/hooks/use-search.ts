
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  authors: any[];
  books: any[];
}

export const useSearch = () => {
  const queryRef = useRef("");
  const [queryDisplay, setQueryDisplay] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchTrigger],
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
    enabled: searchTrigger > 0,
    retry: false
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    queryRef.current = e.target.value;
    setQueryDisplay(e.target.value);
  
    if (e.target.value.trim()) {
      setTimeout(() => {
        setIsSearchOpen(true);
      }, 0);
    } else {
      setIsSearchOpen(false);
    }
  
    setSearchTrigger(prev => prev + 1);
  };

  const handleResultClick = () => {
    setQueryDisplay("");
    queryRef.current = "";
    setIsSearchOpen(false);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return {
    queryRef,
    queryDisplay,
    isSearchOpen,
    searchResults: searchResults || { authors: [], books: [] },
    isLoading,
    handleSearchChange,
    handleResultClick,
    openSearch,
    closeSearch,
    setIsSearchOpen
  };
};
