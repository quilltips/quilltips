
import { Card } from "./ui/card";
import { SearchHeader } from "./search/SearchHeader";
import { AuthorCard, BookCard } from "./search/SearchResultCards";
import { PaginationControls } from "./search/PaginationControls";
import { EmptyResults } from "./search/EmptyResults";
import { useSearchLogic } from "./search/useSearchLogic";

export const Search = () => {
  const {
    query,
    debouncedQuery,
    isLoading,
    totalResults,
    totalPages,
    currentPage,
    paginatedResults,
    handleSearchChange,
    handleKeyDown,
    setCurrentPage,
  } = useSearchLogic();

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
        <SearchHeader 
          query={query}
          handleSearchChange={handleSearchChange}
          handleKeyDown={handleKeyDown}
          isLoading={isLoading}
          debouncedQuery={debouncedQuery}
          totalResults={totalResults}
        />

        {/* Combined paginated results */}
        {paginatedResults.length > 0 && (
          <div className="space-y-4 animate-slideUp">
            {paginatedResults.map((result, index) => (
              result.type === 'author' ? (
                <AuthorCard 
                  key={`author-${result.data.id}`} 
                  author={result.data} 
                />
              ) : (
                <BookCard 
                  key={`book-${result.data.id}`} 
                  book={result.data} 
                />
              )
            ))}
          </div>
        )}

        {/* Empty state */}
        {debouncedQuery && totalResults === 0 && !isLoading && (
          <EmptyResults query={debouncedQuery} />
        )}

        {/* Pagination */}
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
