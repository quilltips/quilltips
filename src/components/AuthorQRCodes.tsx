
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { QRCodeDialog } from "./qr/QRCodeDialog";
import { Loader2 } from "lucide-react";

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
      <div className="grid grid-cols-1 gap-4">
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{qrCode.book_title}</h3>
                {qrCode.publisher && (
                  <p className="text-sm text-muted-foreground">
                    Published by {qrCode.publisher}
                  </p>
                )}
                <Button 
                  className="w-full"
                  onClick={() => setSelectedQRCode({
                    id: qrCode.id,
                    bookTitle: qrCode.book_title,
                  })}
                >
                  Tip for this book
                </Button>
              </div>
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
