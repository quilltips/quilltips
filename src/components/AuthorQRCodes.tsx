import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { QRCodeDialog } from "./qr/QRCodeDialog";

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
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading QR codes...</div>;
  }

  if (!qrCodes?.length) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{qrCode.book_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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