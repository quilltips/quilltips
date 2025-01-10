import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthorQRCodesListProps {
  authorId: string;
}

export const AuthorQRCodesList = ({ authorId }: AuthorQRCodesListProps) => {
  const navigate = useNavigate();
  
  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['qr-codes', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('author_id', authorId)
        .order('book_title', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Group QR codes by book title
  const groupedQRCodes = qrCodes?.reduce((acc, qr) => {
    const book = qr.book_title;
    if (!acc[book]) {
      acc[book] = [];
    }
    acc[book].push(qr);
    return acc;
  }, {} as Record<string, typeof qrCodes>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your QR Codes</h2>
        <Button onClick={() => navigate('/author/create-qr')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New QR Code
        </Button>
      </div>

      {!groupedQRCodes || Object.keys(groupedQRCodes).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You haven't created any QR codes yet. Click the button above to create your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedQRCodes).map(([bookTitle, codes]) => (
          <Card key={bookTitle}>
            <CardHeader>
              <CardTitle>{bookTitle}</CardTitle>
              <CardDescription>
                {codes.length} QR code{codes.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {codes.map((qr) => (
                  <div
                    key={qr.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">Published by {qr.publisher || 'Unknown'}</p>
                      {qr.isbn && <p className="text-sm text-muted-foreground">ISBN: {qr.isbn}</p>}
                      {qr.release_date && (
                        <p className="text-sm text-muted-foreground">
                          Release Date: {format(new Date(qr.release_date), 'PPP')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {qr.is_paid ? (
                        <Button variant="outline" onClick={() => window.open(`/qr/${qr.id}`, '_blank')}>
                          View QR Code
                        </Button>
                      ) : (
                        <Button variant="secondary" disabled>
                          Payment Pending
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};