
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search as SearchIcon, Loader2, Book, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

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

  // Update URL when search changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
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

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
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

        {data?.authors && data.authors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Authors</h2>
            <div className="space-y-4 animate-slideUp">
              {data.authors.map((author: AuthorResult) => (
                <Link 
                  key={author.id} 
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
              ))}
            </div>
          </div>
        )}

        {data?.books && data.books.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Books</h2>
            <div className="space-y-4 animate-slideUp">
              {data.books.map((book: BookResult) => (
                <Link 
                  key={book.id} 
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
              ))}
            </div>
          </div>
        )}

        {debouncedQuery && (!data?.authors?.length && !data?.books?.length) && !isLoading && (
          <Card className="p-6 text-center text-muted-foreground animate-fadeIn bg-white/80 backdrop-blur-sm">
            No results found for "{debouncedQuery}"
          </Card>
        )}
      </div>
    </div>
  );
};
