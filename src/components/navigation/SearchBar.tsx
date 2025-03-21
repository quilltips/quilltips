
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearch } from "@/hooks/use-search";

export const SearchBar = () => {
  console.log("🔥 SearchBar is rendering!");
  
  const {
    query,
    isSearchOpen,
    searchResults,
    isLoading,
    searchInputRef,
    popoverRef,
    setIsSearchOpen,
    handleSearchChange,
    handleSearchFocus,
    handleResultClick,
    handleKeyDown,
    debouncedQuery
  } = useSearch();

  return (
    <div className="relative w-64 search-container">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              ref={searchInputRef}
              value={query}
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
        </PopoverTrigger>
        <PopoverContent 
          ref={popoverRef}
          className="w-[400px] p-0"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <SearchResults
            searchResults={searchResults}
            isLoading={isLoading}
            query={query}
            debouncedQuery={debouncedQuery}
            onResultClick={handleResultClick}
            setIsSearchOpen={setIsSearchOpen}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
