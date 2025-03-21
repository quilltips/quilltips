
import { Card } from "@/components/ui/card";

interface EmptyResultsProps {
  query: string;
}

export const EmptyResults = ({ query }: EmptyResultsProps) => (
  <Card className="p-6 text-center text-muted-foreground animate-fadeIn bg-white/80 backdrop-blur-sm">
    <p className="mb-2">No results found for "{query}"</p>
    <p className="text-sm">Try adjusting your search terms or browse our collections instead.</p>
  </Card>
);
