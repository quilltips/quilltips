
console.log("🔥 SearchBar is rendering!");

import { Search } from "lucide-react";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "./SearchResults";

export const SearchBar = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const {
    queryRef,
    queryDisplay,
    isSearchOpen,
    searchResults,
    isLoading,
    handleSearchChange,
    handleResultClick,
    openSearch,
    setIsSearchOpen
  } = useSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !document.querySelector(".popover-content")?.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchOpen]);

  useEffect(() => {
    if (queryRef.current.length > 0) {
      const timer = setTimeout(() => {
        setIsSearchOpen(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [queryRef, setIsSearchOpen]);
  
  const handleSearchFocus = () => {
    console.log("🔍 Input focused");
    openSearch();
  
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && queryRef.current.trim()) {
      e.preventDefault();
      navigate(`/search?q=${encodeURIComponent(queryRef.current.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="relative w-64 search-container" ref={searchInputRef}>
      <Popover open={isSearchOpen}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                ref={searchInputRef}
                value={queryDisplay}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                placeholder="Search authors or books..."
                className="pl-10 hover-lift rounded-full"
                aria-label="Search authors or books"
                role="searchbox"
                autoComplete="off"
              />
          </div>
        <PopoverContent 
              className={`w-[400px] p-0 ${isSearchOpen ? "" : "hidden"} popover-content`} 
              align="start"
              side="bottom"
              sideOffset={5}
            >
            <Card className="divide-y">
              <SearchResults
                isLoading={isLoading}
                authors={searchResults.authors}
                books={searchResults.books}
                query={queryRef.current}
                onResultClick={handleResultClick}
              />
            </Card>
          </PopoverContent>
      </Popover>
    </div>
  );
};
