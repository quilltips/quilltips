
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search as SearchIcon, Loader2, Book, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface AuthorResult {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  role: string;
}

interface BookResult {
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

export const Search = () => {
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
  const totalResults = (data?.authors?.length || 0) + (data?.books?.length || 0);
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  
  // Get paginated results
  const getPaginatedResults = () => {
    const allResults = [
      ...(data?.authors || []).map(author => ({ type: 'author', data: author })),
      ...(data?.books || []).map(book => ({ type: 'book', data: book }))
    ];
    
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    
    return allResults.slice(startIndex, endIndex);
  };

  const paginatedResults = getPaginatedResults();

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
        <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Search books or authors..."
              className="pl-10 py-6 text-lg"
              autoFocus
            />
          </div>
        </Card>

        {isLoading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Show results summary */}
        {debouncedQuery && !isLoading && (
          <div className="text-lg font-medium text-center mb-6">
            {totalResults === 0 ? (
              <p>No results found for "{debouncedQuery}"</p>
            ) : (
              <p>Found {totalResults} results for "{debouncedQuery}"</p>
            )}
          </div>
        )}

        {/* Combined paginated results */}
        {paginatedResults.length > 0 && (
          <div className="space-y-4 animate-slideUp">
            {paginatedResults.map((result, index) => (
              result.type === 'author' ? (
                <AuthorCard 
                  key={`author-${result.data.id}`} 
                  author={result.data as AuthorResult} 
                />
              ) : (
                <BookCard 
                  key={`book-${result.data.id}`} 
                  book={result.data as BookResult} 
                />
              )
            ))}
          </div>
        )}

        {/* Empty state */}
        {debouncedQuery && totalResults === 0 && !isLoading && (
          <Card className="p-6 text-center text-muted-foreground animate-fadeIn bg-white/80 backdrop-blur-sm">
            <p className="mb-2">No results found for "{debouncedQuery}"</p>
            <p className="text-sm">Try adjusting your search terms or browse our collections instead.</p>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

const AuthorCard = ({ author }: { author: AuthorResult }) => (
  <Link 
    to={`/author/profile/${author.id}`}
    className="block transition-transform hover:scale-102"
  >
    <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
          {author.avatar_url ? (
            <img 
              src={author.avatar_url} 
              alt={author.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-sm">Author</Badge>
          </div>
          <h3 className="text-lg font-semibold">{author.name || 'Anonymous Author'}</h3>
          {author.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </Card>
  </Link>
);

const BookCard = ({ book }: { book: BookResult }) => (
  <Link 
    to={`/qr/${book.id}`}
    className="block transition-transform hover:scale-102"
  >
    <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        {book.cover_image ? (
          <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-md">
            <img 
              src={book.cover_image} 
              alt={book.book_title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-32 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
            <Book className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">Book</Badge>
          </div>
          <h3 className="text-lg font-semibold">{book.book_title}</h3>
          <Link 
            to={`/author/profile/${book.author.id}`}
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            by {book.author.name || 'Anonymous Author'}
          </Link>
          {book.publisher && (
            <p className="text-sm text-muted-foreground">
              Published by {book.publisher}
            </p>
          )}
        </div>
      </div>
    </Card>
  </Link>
);
