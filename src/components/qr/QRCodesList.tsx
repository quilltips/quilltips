
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, QrCode, Plus, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { QRCodeItem } from "./QRCodeItem";

interface QRCodesListProps {
  authorId: string;
}

export const QRCodesList = ({ authorId }: QRCodesListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    data: qrCodes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['qr-codes-list', authorId],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('qr_codes').select('*').eq('author_id', authorId).order('book_title', {
          ascending: true
        });
        
        if (error) throw error;
        return data;
      } catch (err: any) {
        console.error("Error fetching QR codes:", err);
        throw new Error(err.message || "Failed to fetch QR codes");
      }
    },
    retry: 1,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error fetching QR codes",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-[#718096]">
      Unable to load QR codes. Please try refreshing the page.
    </div>;
  }

  if (!qrCodes || qrCodes.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-4 text-[#718096]">
          You haven't created any QR codes yet.
        </div>
        
        <Button 
          onClick={() => navigate('/author/create-qr')} 
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] p-4 h-auto font-medium text-base"
        >
          <Plus className="h-4 w-4 mr-2" />
          New QR code
        </Button>
        
        <div className="flex justify-center">
          <Link 
            to="/about#how-it-works" 
            className="text-sm text-[#718096] hover:text-[#2D3748] flex items-center gap-1"
          >
            <HelpCircle size={14} />
            How does it work?
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {qrCodes.map(qrCode => (
        <QRCodeItem 
          key={qrCode.id} 
          qrCode={qrCode} 
        />
      ))}
    </div>
  );
};
