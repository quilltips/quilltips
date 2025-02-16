
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "../ui/card";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface PublicTipHistoryProps {
  qrCodeId: string;
}

export const PublicTipHistory = ({ qrCodeId }: PublicTipHistoryProps) => {
  const { data: tips, isLoading } = useQuery({
    queryKey: ['public-tips', qrCodeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select('id, created_at, message, name, profiles:author_id (avatar_url)')
        .eq('qr_code_id', qrCodeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.filter(tip => tip.message); // Only show tips with messages
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
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No reader messages yet. Be the first to leave a message!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tips.map((tip) => (
        <div key={tip.id} className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={tip.profiles?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>
              {(tip.name || "Anonymous").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="font-medium">{tip.name || "Anonymous Reader"}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
              </p>
            </div>
            <p className="text-muted-foreground mt-1">{tip.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
