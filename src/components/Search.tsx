import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];

      const { data, error } = await supabase
        .from("qr_codes")
        .select("*, author:profiles(*)")
        .or(`book_title.ilike.%${debouncedQuery}%,author.name.ilike.%${debouncedQuery}%`)
        .order("book_title");

      if (error) throw error;
      return data || [];
    },
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-6 shadow-lg">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books or authors..."
            className="py-6 text-lg"
          />
        </Card>

        {isLoading && <p className="text-center">Loading...</p>}

        {results && results.length > 0 ? (
          results.map((result) => (
            <Card key={result.id} className="p-6">
              <h3 className="font-semibold">{result.book_title}</h3>
              <p className="text-sm text-muted-foreground">
                By {result.author?.name || "Anonymous Author"}
              </p>
            </Card>
          ))
        ) : (
          !isLoading && query && (
            <Card className="p-6 text-center text-muted-foreground">
              No results found for "{query}"
            </Card>
          )
        )}
      </div>
    </div>
  );
};
