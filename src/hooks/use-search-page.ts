
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export const useSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  // Update the query when the URL parameter changes
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    // Update the document title with the search query
    document.title = debouncedQuery ? `Search: ${debouncedQuery} | Quilltips` : "Search | Quilltips";
  }, [debouncedQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      
      const { data: books, error } = await supabase
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
        .order('book_title');

      if (error) {
        console.error('Search error:', error);
        throw error;
      }
      
      console.log('Search results:', books);
      return books || [];
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 1000,
    refetchOnWindowFocus: false
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  return {
    query,
    searchResults,
    isLoading,
    debouncedQuery,
    handleSearchChange,
    handleSearchSubmit
  };
};
