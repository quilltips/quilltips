
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ChevronDown, Loader2, Plus, HelpCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeCard } from "./qr/QRCodeCard";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuthorQRCodesListProps {
  authorId: string;
}

export const AuthorQRCodesList = ({
  authorId
}: AuthorQRCodesListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);
  
  const {
    data: qrCodes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['qr-codes', authorId],
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
    return <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>;
  }
  
  if (error) {
    return <div className="text-center py-4 text-[#718096] text-sm">
      Unable to load QR codes. Please try refreshing the page.
    </div>;
  }

  const displayedQRCodes = showAll ? qrCodes : qrCodes?.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-[#2D3748]">Quilltips Jars</h2>
        {qrCodes && qrCodes.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/author/book-qr-codes?tab=all')}
            className="text-[#718096] hover:text-[#2D3748] text-xs h-auto py-1 px-2"
          >
            See all 
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {!qrCodes || qrCodes.length === 0 ? (
        <div className="space-y-5">
          <div className="text-center py-3 text-[#718096] text-sm">
            You haven't created any Quilltips Jars yet.
          </div>
          
          <Button 
            onClick={() => navigate('/author/book-qr-codes?tab=new')} 
            className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] p-3 h-auto font-medium text-sm"
          >
            <Plus className="h-3 w-3 mr-2" />
            New QR code
          </Button>
          
          <div className="flex justify-center">
            <Link 
              to="/how-it-works" 
              className="text-xs text-[#718096] hover:text-[#2D3748] flex items-center gap-1 underline"
            >
              <HelpCircle size={12} />
              How does it work?
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {displayedQRCodes?.map(qr => (
              <QRCodeCard 
                key={qr.id} 
                qrCode={qr} 
                onNavigate={() => navigate(`/author/qr/${qr.id}`)}
              />
            ))}
            
            {qrCodes.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-[#718096] hover:text-[#2D3748] hover:bg-gray-100 py-1 h-auto text-xs" 
                onClick={() => setShowAll(!showAll)}
              >
                <ChevronDown className={`h-3 w-3 mr-1 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
                {showAll ? 'Show Less' : `Show ${qrCodes.length - 5} More`}
              </Button>
            )}
          </div>
          
          <Button 
            onClick={() => navigate('/author/book-qr-codes?tab=new')} 
            className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] p-3 h-auto font-medium text-sm"
          >
            <Plus className="h-3 w-3 mr-2" />
            New QR code
          </Button>
          
          <div className="flex justify-center">
            <Link 
              to="/how-it-works" 
              className="text-xs text-[#718096] hover:text-[#2D3748] flex items-center gap-1 underline"
            >
              <HelpCircle size={12} />
              How does it work?
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
