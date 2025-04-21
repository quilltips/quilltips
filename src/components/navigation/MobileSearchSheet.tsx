
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search } from "lucide-react";

// Accept new onNavigate prop for closing mobile nav
interface MobileSearchSheetProps {
  onNavigate?: () => void;
}

// placeholder for search result type
interface SearchResult {
  id: string;
  type: "book" | "author";
  name: string;
}

export function MobileSearchSheet({ onNavigate }: MobileSearchSheetProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  // Simulate search results (replace with real search logic if hooked up)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Simulated search logic.
    if (e.target.value.length > 1) {
      setResults([
        { id: "book-1", type: "book", name: "The Great Gatsby" },
        { id: "author-1", type: "author", name: "F. Scott Fitzgerald" },
      ]);
    } else {
      setResults([]);
    }
  };

  // Navigate to the route, close both the sheet and mobile nav/nav menu when present
  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    if (onNavigate) onNavigate();
    if (result.type === "book") {
      navigate(`/book/${result.id}`);
    } else {
      navigate(`/author/profile/${result.id}`);
    }
    setSearch('');
  };

  // Handle pressing Enter in the search bar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent/10 p-2"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="!p-0 max-w-full">
        <form onSubmit={handleSubmit} className="p-4 bg-background">
          <input
            value={search}
            onChange={handleInputChange}
            placeholder="Search books or authors"
            className="w-full px-3 py-2 border rounded"
            autoFocus
          />
        </form>
        {results.length > 0 && (
          <ul className="p-4 space-y-2">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent/20"
                  onClick={() => handleResultClick(result)}
                  type="button"
                >
                  {result.type === "book" ? "📖" : "🖊️"} {result.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {results.length === 0 && search.length > 1 && (
          <div className="px-4 pb-4 text-muted-foreground">
            No results found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
