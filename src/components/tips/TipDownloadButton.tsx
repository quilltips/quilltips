import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TipDownloadButtonProps {
  tips: any[];
  likes: any[];
  comments: any[];
  qrCodeId?: string;
}

export const TipDownloadButton = ({ 
  tips, 
  likes, 
  comments, 
  qrCodeId 
}: TipDownloadButtonProps) => {
  const { toast } = useToast();

  const handleDownloadAll = async () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Date', 'Book', 'Amount', 'Message', 'Likes', 'Comments'].join(','),
        ...(tips || []).map(tip => [
          new Date(tip.created_at).toLocaleDateString(),
          `"${(tip.book_title || 'N/A').replace(/"/g, '""')}"`,
          tip.amount,
          `"${(tip.message || '').replace(/"/g, '""')}"`,
          likes?.filter(like => like.tip_id === tip.id).length || 0,
          comments?.filter(comment => comment.tip_id === tip.id).length || 0
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tips_${qrCodeId ? `qr_${qrCodeId}_` : ''}${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your tip data is being downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDownloadAll}
      className="ml-2"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};