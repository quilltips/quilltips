
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
        try {
          const [authorsResponse, booksResponse] = await Promise.all([
            supabase
              .from('public_profiles')
              .select('id, name, bio, avatar_url, slug')
              .ilike('name', `%${debouncedQuery}%`)
              .order('name')
              .limit(5),

            supabase
              .from('qr_codes')
              .select('id, book_title, publisher, cover_image, author_id')
              .ilike('book_title', `%${debouncedQuery}%`)
              .order('book_title')
              .limit(5),
          ]);
          
          // Add error logging
          if (authorsResponse.error) console.error('Authors search error:', authorsResponse.error);
          if (booksResponse.error) console.error('Books search error:', booksResponse.error);

          // Get author details for the books
          const books = [];
          if (booksResponse.data && booksResponse.data.length > 0) {
            const authorIds = booksResponse.data.map(book => book.author_id);
            const authorsForBooksResponse = await supabase
              .from('public_profiles')
              .select('id, name, avatar_url, slug')
              .in('id', authorIds);

            if (authorsForBooksResponse.data) {
              const authorsMap = new Map(authorsForBooksResponse.data.map(author => [author.id, author]));
              
              for (const book of booksResponse.data) {
                const author = authorsMap.get(book.author_id);
                if (author) {
                  books.push({
                    ...book,
                    author
                  });
                }
              }
            }
          }

          return {
            authors: authorsResponse.data || [],
            books,
          };
        } catch (error) {
          console.error('Quick search error:', error);
          return { authors: [], books: [] };
        }
      } 
      
      // For full search (search page), fetch more comprehensive results
      else {
        try {
          // Fetch books that match by title
          const bookTitleQuery = await supabase
            .from('qr_codes')
            .select('id, book_title, publisher, cover_image, author_id')
            .ilike('book_title', `%${debouncedQuery}%`)
            .order('book_title');

          // Fetch matching authors for full search results
          const authorsQuery = await supabase
            .from('public_profiles')
            .select('id, name, bio, avatar_url, slug')
            .ilike('name', `%${debouncedQuery}%`)
            .order('name')
            .limit(20);

          // Add error logging
          if (bookTitleQuery.error) console.error('Book title search error:', bookTitleQuery.error);
          if (authorsQuery.error) console.error('Authors search error (full):', authorsQuery.error);

          // Get author details for books and find books by author name
          const books = [];
          const authorResults = authorsQuery.data || [];
          
          if (bookTitleQuery.data && bookTitleQuery.data.length > 0) {
            const authorIds = bookTitleQuery.data.map(book => book.author_id);
            const authorsForBooksResponse = await supabase
              .from('public_profiles')
              .select('id, name, avatar_url, slug')
              .in('id', authorIds);

            if (authorsForBooksResponse.data) {
              const authorsMap = new Map(authorsForBooksResponse.data.map(author => [author.id, author]));
              
              for (const book of bookTitleQuery.data) {
                const author = authorsMap.get(book.author_id);
                if (author) {
                  books.push({
                    ...book,
                    author
                  });
                }
              }
            }
          }

          // Also search for books by author name
          if (authorResults.length > 0) {
            const authorIds = authorResults.map(author => author.id);
            const booksByAuthorQuery = await supabase
              .from('qr_codes')
              .select('id, book_title, publisher, cover_image, author_id')
              .in('author_id', authorIds)
              .order('book_title');

            if (booksByAuthorQuery.data) {
              const authorsMap = new Map(authorResults.map(author => [author.id, author]));
              
              for (const book of booksByAuthorQuery.data) {
                const author = authorsMap.get(book.author_id);
                if (author && !books.find(b => b.id === book.id)) {
                  books.push({
                    ...book,
                    author
                  });
                }
              }
            }
          }

          return { 
            books: books || [], 
            authors: authorResults 
          };
        } catch (error) {
          console.error('Full search error:', error);
          return { books: [], authors: [] };
        }
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
