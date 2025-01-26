import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthorQRCodeStats } from "./AuthorQRCodeStats";
import { QRCodeCard } from "./qr/QRCodeCard";
import { useState } from "react";

interface AuthorQRCodesListProps {
  authorId: string;
}

export const AuthorQRCodesList = ({ authorId }: AuthorQRCodesListProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
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

  const displayedQRCodes = showAll ? qrCodes : qrCodes?.slice(0, 5);

  return (
    <div className="space-y-6">
      <AuthorQRCodeStats authorId={authorId} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your QR Codes</h2>
        <Button onClick={() => navigate('/author/create-qr')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New QR Code
        </Button>
      </div>

      {!qrCodes || qrCodes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You haven't created any QR codes yet. Click the button above to create your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayedQRCodes?.map((qr) => (
            <QRCodeCard
              key={qr.id}
              qrCode={qr}
              onNavigate={(id) => navigate(`/qr/${id}`)}
            />
          ))}
          
          {qrCodes.length > 5 && (
            <Button
              variant="ghost"
              className="w-full mt-4 text-muted-foreground hover:text-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              <ChevronDown className={`h-4 w-4 mr-2 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
              {showAll ? 'Show Less' : `Show ${qrCodes.length - 5} More`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};