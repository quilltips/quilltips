
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './use-debounce';
import { useNavigate } from 'react-router-dom';

export interface SearchAuthor {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  role?: string;
}

export interface SearchBook {
  id: string;
  book_title: string;
  publisher?: string;
  cover_image?: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export type SearchType = 'quick' | 'full';

export function useSearch(initialQuery = '', type: SearchType = 'quick') {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  // Reset query when initialQuery changes (e.g., from URL params)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, type],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { authors: [], books: [] };

      // For quick search (in navbar), fetch limited results
      if (type === 'quick') {
        const [authorsResponse, booksResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .ilike('name', `%${debouncedQuery}%`)
            .eq('role', 'author')
            .order('name')
            .limit(5),

          supabase
            .from('qr_codes')
            .select('*, author:profiles(*)')
            .ilike('book_title', `%${debouncedQuery}%`)
            .order('book_title')
            .limit(5),
        ]);

        return {
          authors: authorsResponse.data || [],
          books: booksResponse.data || [],
        };
      } 
      
      // For full search (search page), fetch more comprehensive results
      else {
        // Fix the search query syntax - separate the queries instead of using OR with complex conditions
        const bookTitleQuery = await supabase
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
          .ilike('book_title', `%${debouncedQuery}%`)
          .order('book_title');

        const authorNameQuery = await supabase
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
          .ilike('author.name', `%${debouncedQuery}%`)
          .order('book_title');

        // Combine results, removing duplicates
        const allBooks = [...(bookTitleQuery.data || []), ...(authorNameQuery.data || [])];
        const uniqueBooks = Array.from(new Map(allBooks.map(book => [book.id, book])).values());

        if (bookTitleQuery.error || authorNameQuery.error) {
          console.error('Search error:', bookTitleQuery.error || authorNameQuery.error);
          throw bookTitleQuery.error || authorNameQuery.error;
        }

        return { books: uniqueBooks || [], authors: [] };
      }
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 1000,
    refetchOnWindowFocus: false,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      return true;
    }
    return false;
  };

  const navigateToSearchPage = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return {
    query,
    setQuery,
    results: data,
    isLoading,
    handleSearch,
    handleKeyDown,
    navigateToSearchPage,
  };
}
