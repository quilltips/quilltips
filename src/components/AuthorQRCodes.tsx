import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Loader2, Book, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface AuthorQRCodesProps {
  authorId: string;
  authorName: string;
}

export const AuthorQRCodes = ({ authorId, authorName }: AuthorQRCodesProps) => {
  const [showAll, setShowAll] = useState(false);

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

  const displayedQRCodes = showAll ? qrCodes : qrCodes.slice(0, 5);

  return (
    <div className="space-y-3">
      {displayedQRCodes.map((qrCode) => (
        <Link 
          key={qrCode.id}
          to={`/qr/${qrCode.id}`} 
          className="block group"
        >
          <Card className="transition-all hover:shadow-md hover:scale-[1.01]">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 flex-shrink-0 rounded-sm overflow-hidden border border-gray-200 shadow-sm bg-white">
                  {qrCode.cover_image ? (
                    <img
                      src={qrCode.cover_image}
                      alt={qrCode.book_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#19363C]/50">
                      <Book className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-base text-[#19363C] leading-tight">{qrCode.book_title}</h3>
                  <p className="text-sm text-muted-foreground">by {authorName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {qrCodes.length > 5 && (
        <Button 
          variant="ghost" 
          onClick={() => setShowAll(!showAll)} 
          className="w-full text-[#718096] hover:text-[#2D3748] hover:bg-gray-100"
        >
          <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show Less' : `Show ${qrCodes.length - 5} More`}
        </Button>
      )}
    </div>
  );
};
