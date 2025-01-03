import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search as SearchIcon } from "lucide-react";

export const Search = () => {
  const [query, setQuery] = useState("");

  return (
    <Card className="glass-card p-6 max-w-2xl mx-auto animate-enter">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by author or book title..."
          className="pl-10 hover-lift"
        />
      </div>
    </Card>
  );
};