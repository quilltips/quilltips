
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LoadingSpinner } from "../ui/loading-spinner";

interface AuthorPublicTipFeedProps {
  authorId: string;
  limit?: number;
}

interface PublicTip {
  id: string;
  created_at: string;
  message: string | null;
  reader_name: string | null;
  reader_avatar_url: string | null;
  qr_code_id: string | null;
}

export const AuthorPublicTipFeed = ({ authorId, limit = 5 }: AuthorPublicTipFeedProps) => {
  const { data: tips, isLoading } = useQuery({
    queryKey: ['author-public-tips', authorId],
    queryFn: async () => {
      // First, get all QR codes for this author
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('author_id', authorId);
      
      if (qrError) throw qrError;
      if (!qrCodes || qrCodes.length === 0) return [];
      
      const qrCodeIds = qrCodes.map(qr => qr.id);
      
      // Then get all public tips for these QR codes
      const { data: tipsData, error: tipsError } = await supabase
        .from('public_tips')
        .select(`
          id,
          created_at,
          message,
          reader_name,
          reader_avatar_url,
          qr_code_id
        `)
        .in('qr_code_id', qrCodeIds)
        .order('created_at', { ascending: false })
        .limit(limit || 5);

      if (tipsError) throw tipsError;
      return tipsData as PublicTip[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tips?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No tips yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tips.map((tip) => {
        // Extract first name from reader_name for privacy
        const readerFirstName = tip.reader_name 
          ? tip.reader_name.split(' ')[0] 
          : "Someone";
        
        return (
          <div key={tip.id} className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tip.reader_avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="space-y-1">
                  <p className="font-medium">
                    {readerFirstName} sent some love
                    {/* We've removed the amount display as requested */}
                  </p>
                  {tip.message && (
                    <p className="text-muted-foreground">"{tip.message}"</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-border mt-2 pt-2"></div>
          </div>
        );
      })}
    </div>
  );
};
