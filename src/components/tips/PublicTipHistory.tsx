
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "../ui/card";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSquare, ThumbsUp } from "lucide-react";

interface PublicTipHistoryProps {
  qrCodeId: string;
}

// Define a type for the public tip data
interface PublicTip {
  id: string;
  created_at: string;
  message: string | null;
  amount: number;
  reader_name: string | null;
  reader_avatar_url: string | null;
}

export const PublicTipHistory = ({ qrCodeId }: PublicTipHistoryProps) => {
  const { data: tips, isLoading } = useQuery({
    queryKey: ['public-tips', qrCodeId],
    queryFn: async () => {
      // Cast the response type to handle the type issue with the new table
      const { data, error } = await supabase
        .from('public_tips')
        .select(`
          id,
          created_at,
          message,
          amount,
          reader_name,
          reader_avatar_url
        `)
        .eq('qr_code_id', qrCodeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PublicTip[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin w-6 h-6 border-2 border-primary rounded-full border-t-transparent" />
      </div>
    );
  }

  if (!tips?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No tips yet. Be the first to leave a tip!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tips.map((tip) => (
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
                <div className="flex justify-between items-baseline">
                  <p className="font-medium">
                    {tip.reader_name || "Anonymous Reader"} sent ${tip.amount}
                  </p>
                </div>
                {tip.message && (
                  <p className="text-muted-foreground">"{tip.message}"</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex gap-4 mt-3">
                <button className="flex items-center text-muted-foreground hover:text-foreground">
                  <ThumbsUp className="h-5 w-5 mr-1" />
                </button>
                <button className="flex items-center text-muted-foreground hover:text-foreground">
                  <MessageSquare className="h-5 w-5 mr-1" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-2 pt-2"></div>
        </div>
      ))}
    </div>
  );
};
