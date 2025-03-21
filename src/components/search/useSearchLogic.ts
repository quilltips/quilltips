
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchResults } from "./types";

export const useSearchLogic = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  // Update URL when search changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
      setCurrentPage(1); // Reset to first page on new search
    } else if (searchParams.has("q")) {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['full-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { authors: [], books: [] };
      
      try {
        const [authorsResponse, booksResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .ilike('name', `%${debouncedQuery}%`)
            .eq('role', 'author')
            .order('name'),
        
          supabase
            .from('qr_codes')
            .select(`
              id,
              book_title,
              publisher,
              cover_image,
              author:profiles (
                id,
                name,
                avatar_url
              )
            `)
            .or(`book_title.ilike.%${debouncedQuery}%,author.name.ilike.%${debouncedQuery}%`)
            .order('book_title')
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
    staleTime: 1000,
    refetchOnWindowFocus: false
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        setSearchParams({ q: query.trim() });
      }
    }
  };

  // Calculate pagination
  const searchResults = data || { authors: [], books: [] };
  const totalResults = (searchResults.authors?.length || 0) + (searchResults.books?.length || 0);
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  
  // Get paginated results
  const getPaginatedResults = () => {
    const allResults = [
      ...(searchResults.authors || []).map(author => ({ type: 'author', data: author })),
      ...(searchResults.books || []).map(book => ({ type: 'book', data: book }))
    ];
    
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    
    return allResults.slice(startIndex, endIndex);
  };

  const paginatedResults = getPaginatedResults();

  return {
    query,
    debouncedQuery,
    isLoading,
    searchResults,
    totalResults,
    totalPages,
    currentPage,
    paginatedResults,
    handleSearchChange,
    handleKeyDown,
    setCurrentPage,
  };
};
