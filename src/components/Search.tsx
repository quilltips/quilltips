import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthorProfile } from "./AuthorProfile";

export const Search = () => {
  const [query, setQuery] = useState("");

  const { data: authors, isLoading } = useQuery({
    queryKey: ['authors', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`)
        .eq('role', 'author')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: query.length > 0
  });

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="space-y-6 max-w-2xl mx-auto animate-enter">
        <Card className="glass-card p-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search authors by name..."
              className="pl-10 hover-lift"
            />
          </div>
        </Card>

        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {authors && authors.length > 0 && (
          <div className="space-y-4">
            {authors.map((author) => (
              <Link key={author.id} to={`/author/${author.id}`} className="block hover:opacity-80 transition-opacity">
                <AuthorProfile
                  name={author.name || 'Anonymous Author'}
                  bio={author.bio || 'No bio available'}
                  imageUrl="/placeholder.svg"
                />
              </Link>
            ))}
          </div>
        )}

        {query && authors?.length === 0 && !isLoading && (
          <Card className="glass-card p-6 text-center text-muted-foreground">
            No authors found matching "{query}"
          </Card>
        )}
      </div>
    </div>
  );
};