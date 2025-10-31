import { Search, Book, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch } from "@/hooks/use-search";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAuthorUrl } from "@/lib/url-utils";
import { useSlugGeneration } from "@/hooks/use-slug-generation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FEATURED_AUTHOR_IDS = [
  "2964531d-4ba6-4b61-8716-8c63a80f3cae", // Tyler Tarter
  "55056f35-3a44-4d79-8558-69e003be17b0", // Kelly Schweiger
  "51c62b82-f4ed-42d2-83e5-8d73d77482a4", // T.M. Thomas
  "e14f7979-c1ca-4a91-9eb7-df4098759bac", // Frank Eugene Dukes Jr
  "3f6b03df-9231-451c-ac2e-491fe9be584c", // Melize Smit
];

export const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { generateBookUrl } = useSlugGeneration();
  
  const {
    query,
    setQuery,
    results,
    isLoading,
    handleSearch,
    handleKeyDown,
    navigateToSearchPage,
  } = useSearch('', 'quick');

  // Fetch featured authors when search is open
  const { data: featuredAuthors, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["featured-authors-search"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("id, name, bio, avatar_url, slug")
        .in("id", FEATURED_AUTHOR_IDS);

      if (error) throw error;
      
      // Sort by the order in FEATURED_AUTHOR_IDS and limit to 5
      return (data || []).sort((a, b) => 
        FEATURED_AUTHOR_IDS.indexOf(a.id) - FEATURED_AUTHOR_IDS.indexOf(b.id)
      ).slice(0, 5);
    },
    enabled: isSearchOpen && !query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isSearchOpen]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleKeyDown(e)) {
      setIsSearchOpen(false);
    }
  };

  const handleClosePopover = () => {
    setIsSearchOpen(false);
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
  };

  return (
    <div className="relative w-64">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 cursor-pointer plausible-event-name=search" 
            onClick={handleSearchIconClick}
          />

          <PopoverTrigger asChild>
            <div ref={triggerRef}>
              <Input
                ref={searchInputRef}
                value={query}
                onChange={handleSearch}
                onKeyDown={handleInputKeyDown}
                placeholder="Search authors or books..."
                className="pl-10 rounded-full plausible-event-name=search"
                aria-label="Search authors or books"
                role="searchbox"
                autoComplete="off"
              />
            </div>
          </PopoverTrigger>
        </div>

        <PopoverContent
          className="w-[400px] p-0 popover-content"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <Card className="divide-y max-h-[60vh]">
            {isLoading ? (
              <div className="p-4 text-center">Searching...</div>
            ) : (
              <>
                <ScrollArea className="max-h-[50vh]">
                  {/* Show featured authors when query is empty */}
                  {!query.trim() && (
                    <>
                      {isLoadingFeatured ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading featured authors...</div>
                      ) : featuredAuthors && featuredAuthors.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                            Featured Authors
                          </div>
                          {featuredAuthors.map((author) => (
                            <Link
                              key={author.id}
                              to={getAuthorUrl(author)}
                              className="block p-3 hover:bg-accent transition-colors"
                              onClick={handleClosePopover}
                            >
                              <div className="flex items-center gap-3">
                                {author.avatar_url ? (
                                  <img
                                    src={author.avatar_url}
                                    alt={author.name || "Author"}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[#19363C] text-[#FFD166] flex items-center justify-center text-sm font-medium flex-shrink-0">
                                    {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{author.name || "Anonymous Author"}</p>
                                  {author.bio && (
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                      {author.bio.length > 50 ? author.bio.substring(0, 50) + '...' : author.bio}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Type to search...
                        </div>
                      )}
                    </>
                  )}

                  {/* Show search results when query has content */}
                  {query.trim() && (
                    <>
                      {results?.authors?.filter(author => author && author.id).map((author) => (
                        <Link
                          key={author.id}
                          to={getAuthorUrl(author)}
                          className="block p-3 hover:bg-accent transition-colors"
                          onClick={handleClosePopover}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3" />
                            <Badge variant="secondary" className="text-xs py-0 px-1.5">Author</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            {author.avatar_url ? (
                              <img
                                src={author.avatar_url}
                                alt={author.name || "Author"}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#19363C] text-[#FFD166] flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{author.name || "Anonymous Author"}</p>
                              {author.bio && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[300px]">
                                  {author.bio.length > 60 ? author.bio.substring(0, 60) + '...' : author.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      {results?.books?.filter(book => book && book.id && book.author).map((book) => (
                        <Link
                          key={book.id}
                          to={generateBookUrl(book.book_title || 'book')}
                          className="block p-3 hover:bg-accent transition-colors"
                          onClick={handleClosePopover}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Book className="h-3 w-3" />
                            <Badge variant="default" className="text-xs py-0 px-1.5 bg-[#19363C] text-white">Book</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.book_title || "Book"}
                                className="w-10 h-14 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-14 rounded flex items-center justify-center flex-shrink-0 bg-muted">
                                <img 
                                  src="/lovable-uploads/logo_nav.png" 
                                  alt="Book cover" 
                                  className="h-6 w-6 object-contain opacity-50"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{book.book_title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                By <Link 
                                    to={getAuthorUrl(book.author)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClosePopover();
                                    }}
                                    className="hover:underline"
                                  >
                                    {book.author?.name || "Anonymous Author"}
                                  </Link>
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {!isLoading && !results?.authors?.length && !results?.books?.length && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No results found for "{query}"
                        </div>
                      )}
                    </>
                  )}
                </ScrollArea>
                {query.trim() && (
                  <div className="p-2 border-t">
                    <button
                      onClick={() => {
                        navigateToSearchPage();
                        handleClosePopover();
                      }}
                      className="w-full py-1.5 px-3 bg-secondary/50 hover:bg-secondary rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-colors"
                    >
                      <Search className="h-3 w-3" />
                      View all results for "{query}"
                    </button>
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
