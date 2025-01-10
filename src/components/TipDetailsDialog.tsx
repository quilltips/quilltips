import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card } from "./ui/card";

interface TipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tip: {
    id: string;
    amount: number;
    message: string | null;
    created_at: string;
    book_title: string | null;
    author_id: string;
  } | null;
}

export const TipDetailsDialog = ({ isOpen, onClose, tip }: TipDetailsDialogProps) => {
  const { data: tipper } = useQuery({
    queryKey: ['profile', tip?.author_id],
    queryFn: async () => {
      if (!tip?.author_id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tip.author_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tip?.author_id,
  });

  if (!tip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tip Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>
                {tipper?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{tipper?.name || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">{tipper?.bio || 'No bio available'}</p>
            </div>
          </div>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount</span>
              <span className="text-green-600">${tip.amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Date</span>
              <span>{format(new Date(tip.created_at), 'PPP')}</span>
            </div>
            {tip.book_title && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Book</span>
                <span>{tip.book_title}</span>
              </div>
            )}
            {tip.message && (
              <div className="mt-4">
                <p className="font-medium mb-2">Message</p>
                <p className="text-muted-foreground">{tip.message}</p>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};