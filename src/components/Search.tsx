import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search as SearchIcon, Loader2, Book, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthorPublicProfileView } from "./AuthorPublicProfile";
import { Badge } from "./ui/badge";

export const Search = () => {
  const [query, setQuery] = useState("");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return { authors: [], books: [] };
      
      // Search authors by name
      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`)
        .eq('role', 'author')
        .order('name');

      if (authorsError) throw authorsError;

      // Search QR codes by book title
      const { data: books, error: booksError } = await supabase
        .from('qr_codes')
        .select(`
          *,
          author:profiles(*)
        `)
        .ilike('book_title', `%${query}%`)
        .order('book_title');

      if (booksError) throw booksError;

      return {
        authors: authors || [],
        books: books || []
      };
    },
    enabled: query.length > 0
  });

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-2xl mx-auto animate-enter">
        <Card className="glass-card p-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search authors or books..."
              className="pl-10 hover-lift"
            />
          </div>
        </Card>

        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {searchResults && (searchResults.authors.length > 0 || searchResults.books.length > 0) && (
          <div className="space-y-4">
            {searchResults.authors.map((author) => (
              <Link key={author.id} to={`/author/profile/${author.id}`} className="block hover:opacity-80 transition-opacity">
                <Card className="glass-card p-6">
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
                </Card>
              </Link>
            ))}

            {searchResults.books.map((book) => (
              <Link 
                key={book.id} 
                to={`/author/profile/${book.author.id}`} 
                className="block hover:opacity-80 transition-opacity"
              >
                <Card className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Book className="h-4 w-4" />
                    <Badge variant="secondary">Book</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{book.book_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      By {book.author.name || 'Anonymous Author'}
                    </p>
                    {book.publisher && (
                      <p className="text-sm text-muted-foreground">
                        Published by {book.publisher}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {query && (!searchResults?.authors.length && !searchResults?.books.length) && !isLoading && (
          <Card className="glass-card p-6 text-center text-muted-foreground">
            No results found for "{query}"
          </Card>
        )}
      </div>
    </div>
  );
};