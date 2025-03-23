
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ChevronDown, Loader2, Plus, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeCard } from "./qr/QRCodeCard";
import { useState } from "react";
import { Link } from "react-router-dom";

interface AuthorQRCodesListProps {
  authorId: string;
}

export const AuthorQRCodesList = ({
  authorId
}: AuthorQRCodesListProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const {
    data: qrCodes,
    isLoading
  } = useQuery({
    queryKey: ['qr-codes', authorId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('qr_codes').select('*').eq('author_id', authorId).order('book_title', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }

  const displayedQRCodes = showAll ? qrCodes : qrCodes?.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-[#2D3748]">Quilltip Jars</h2>
      </div>

      {!qrCodes || qrCodes.length === 0 ? (
        <div className="space-y-8">
          <div className="text-center py-4 text-[#718096]">
            You haven't created any Quilltip jars yet.
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
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {displayedQRCodes?.map(qr => (
              <QRCodeCard key={qr.id} qrCode={qr} onNavigate={id => navigate(`/qr/${id}`)} />
            ))}
            
            {qrCodes.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-[#718096] hover:text-[#2D3748] hover:bg-gray-100" 
                onClick={() => setShowAll(!showAll)}
              >
                <ChevronDown className={`h-4 w-4 mr-2 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
                {showAll ? 'Show Less' : `Show ${qrCodes.length - 5} More`}
              </Button>
            )}
          </div>
          
          <Button 
            onClick={() => navigate('/author/create-qr')} 
            className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] p-4 h-auto font-medium text-base"
          >
            <Plus className="h-4 w-4 mr-2" />
            New QR code
          </Button>
        </div>
      )}
    </div>
  );
};
