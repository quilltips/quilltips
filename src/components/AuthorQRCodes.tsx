
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { QRCodeDialog } from "./qr/QRCodeDialog";
import { Loader2, GiftIcon } from "lucide-react";
import { format } from "date-fns";

interface AuthorQRCodesProps {
  authorId: string;
  authorName: string;
}

export const AuthorQRCodes = ({ authorId, authorName }: AuthorQRCodesProps) => {
  const [selectedQRCode, setSelectedQRCode] = useState<{
    id: string;
    bookTitle: string;
  } | null>(null);

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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode) => (
          <Card 
            key={qrCode.id} 
            className="overflow-hidden bg-white rounded-2xl hover:shadow-lg transition-all duration-300 border-2 border-[#FEF7CD]"
          >
            <CardContent className="p-6 space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#F2FCE2]">
                <img
                  src={qrCode.cover_image || "/placeholder.svg"}
                  alt={qrCode.book_title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {qrCode.book_title}
                </h3>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  {qrCode.publisher && (
                    <p>Published by {qrCode.publisher}</p>
                  )}
                  {qrCode.release_date && (
                    <p>Released {format(new Date(qrCode.release_date), 'MMMM yyyy')}</p>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => setSelectedQRCode({
                  id: qrCode.id,
                  bookTitle: qrCode.book_title,
                })}
                className="w-full bg-[#FEF7CD] hover:bg-[#FDE1D3] text-[#403E43] transition-colors duration-200"
              >
                <GiftIcon className="mr-2 h-4 w-4" />
                Send a Tip
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <QRCodeDialog
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        selectedQRCode={selectedQRCode}
        authorId={authorId}
      />
    </>
  );
};
