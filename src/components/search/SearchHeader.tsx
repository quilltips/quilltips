
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, Loader2 } from "lucide-react";

interface SearchHeaderProps {
  query: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  debouncedQuery: string;
  totalResults: number;
}

export const SearchHeader = ({ 
  query, 
  handleSearchChange, 
  handleKeyDown,
  isLoading,
  debouncedQuery,
  totalResults
}: SearchHeaderProps) => (
  <>
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

    {/* Show results summary */}
    {debouncedQuery && !isLoading && (
      <div className="text-lg font-medium text-center mb-6">
        {totalResults === 0 ? (
          <p>No results found for "{debouncedQuery}"</p>
        ) : (
          <p>Found {totalResults} results for "{debouncedQuery}"</p>
        )}
      </div>
    )}
  </>
);
