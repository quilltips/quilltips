import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search as SearchIcon, Loader2, Book } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
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
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

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

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
        <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={handleSearchChange}
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

        {searchResults && searchResults.length > 0 && (
          <div className="space-y-4 animate-slideUp">
            {searchResults.map((result: SearchResult) => (
              <Link 
                key={result.id} 
                to={`/qr/${result.id}`}
                className="block transition-transform hover:scale-102"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    {result.cover_image ? (
                      <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-md">
                        <img 
                          src={result.cover_image} 
                          alt={result.book_title}
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
                      <h3 className="text-lg font-semibold">{result.book_title}</h3>
                      <Link 
                        to={`/author/profile/${result.author.id}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        by {result.author.name || 'Anonymous Author'}
                      </Link>
                      {result.publisher && (
                        <p className="text-sm text-muted-foreground">
                          Published by {result.publisher}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {query && (!searchResults?.length) && !isLoading && (
          <Card className="p-6 text-center text-muted-foreground animate-fadeIn bg-white/80 backdrop-blur-sm">
            No results found for "{query}"
          </Card>
        )}
      </div>
    </div>
  );
};