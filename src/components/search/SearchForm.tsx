
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

interface SearchFormProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SearchForm = ({ query, onQueryChange, onSubmit }: SearchFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={onQueryChange}
            placeholder="Search books or authors..."
            className="pl-10 py-6 text-lg"
            autoFocus
          />
        </div>
      </Card>
    </form>
  );
};
