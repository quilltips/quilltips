
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";
import { BookCard } from "./BookCard";

interface AuthorQRCodesProps {
  authorId: string;
  authorName: string;
}

export const AuthorQRCodes = ({ authorId, authorName }: AuthorQRCodesProps) => {
  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['qrCodes', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('author_id', authorId)
        .order('book_title', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!qrCodes?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No books available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {qrCodes.map((qrCode) => (
        <BookCard
          key={qrCode.id}
          id={qrCode.id}
          title={qrCode.book_title}
          authorId={authorId}
          authorName={authorName}
          coverImage={qrCode.cover_image}
          publisher={qrCode.publisher}
          isbn={qrCode.isbn}
          releaseDate={qrCode.release_date}
        />
      ))}
    </div>
  );
};
