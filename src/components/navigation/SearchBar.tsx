import { Search, Book, User } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { authors: [], books: [] };

      const [authorsResponse, booksResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .ilike("name", `%${debouncedQuery}%`)
          .eq("role", "author")
          .order("name")
          .limit(5),

        supabase
          .from("qr_codes")
          .select("*, author:profiles(*)")
          .ilike("book_title", `%${debouncedQuery}%`)
          .order("book_title")
          .limit(5),
      ]);

      return {
        authors: authorsResponse.data || [],
        books: booksResponse.data || [],
      };
    },
    enabled: debouncedQuery.length > 0,
    retry: false,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-64">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />

        <PopoverTrigger asChild>
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search authors or books..."
            className="pl-10 hover-lift rounded-full"
            aria-label="Search authors or books"
            role="searchbox"
            autoComplete="off"
          />
        </PopoverTrigger>

        <PopoverContent
          className="w-[400px] p-0 popover-content"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <Card className="divide-y">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Searching...</div>
            ) : (
              <>
                {searchResults?.authors?.map((author) => (
                  <Link
                    key={author.id}
                    to={`/author/profile/${author.id}`}
                    className="block p-4 hover:bg-accent"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <Badge variant="secondary">Author</Badge>
                    </div>
                    <AuthorPublicProfileView
                      name={author.name || "Anonymous Author"}
                      bio={author.bio || "No bio available"}
                      imageUrl="/placeholder.svg"
                      authorId={author.id}
                    />
                  </Link>
                ))}
                {searchResults?.books?.map((book) => (
                  <Link
                    key={book.id}
                    to={`/author/profile/${book.author.id}`}
                    className="block p-4 hover:bg-accent"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-4 w-4" />
                      <Badge variant="secondary">Book</Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{book.book_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        By {book.author.name || "Anonymous Author"}
                      </p>
                    </div>
                  </Link>
                ))}
                {!searchResults?.authors?.length && !searchResults?.books?.length && (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{query}"
                  </div>
                )}
              </>
            )}
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};
