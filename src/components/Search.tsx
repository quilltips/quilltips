
import { SearchForm } from "./search/SearchForm";
import { SearchResultsList } from "./search/SearchResultsList";
import { useSearchPage } from "@/hooks/use-search-page";

export const Search = () => {
  const {
    query,
    searchResults,
    isLoading,
    debouncedQuery,
    handleSearchChange,
    handleSearchSubmit
  } = useSearchPage();

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
        <SearchForm 
          query={query} 
          onQueryChange={handleSearchChange} 
          onSubmit={handleSearchSubmit} 
        />

        <SearchResultsList 
          results={searchResults || []} 
          isLoading={isLoading} 
          query={debouncedQuery} 
        />
      </div>
    </div>
  );
};
