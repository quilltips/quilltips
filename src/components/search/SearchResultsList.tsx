
import { Card } from "@/components/ui/card";
import { SearchResultItem } from "./SearchResultItem";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

interface SearchResultsListProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

export const SearchResultsList = ({ results, isLoading, query }: SearchResultsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (results && results.length > 0) {
    return (
      <div className="space-y-4 animate-slideUp">
        <h2 className="text-lg font-medium text-muted-foreground">
          Search results for "{query}"
        </h2>
        {results.map((result) => (
          <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
            <SearchResultItem {...result} />
          </Card>
        ))}
      </div>
    );
  }

  if (query && !isLoading) {
    return (
      <Card className="p-6 text-center text-muted-foreground animate-fadeIn bg-white/80 backdrop-blur-sm">
        No results found for "{query}"
      </Card>
    );
  }

  return null;
};
