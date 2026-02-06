
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, QrCode, HelpCircle, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { QRCodeItem } from "./QRCodeItem";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface QRCodesListProps {
  authorId: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
}

export const QRCodesList = ({ 
  authorId,
  stripeSetupComplete = true,
  hasStripeAccount = true 
}: QRCodesListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const stripeIncomplete = !hasStripeAccount || !stripeSetupComplete;
  
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

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    
    // Auto-close the popover after 3s on mobile
    if (open && window.innerWidth < 768) {
      setTimeout(() => setIsPopoverOpen(false), 3000);
    }
  };

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
          You haven't created any books yet.
        </div>
        
        <div className="flex justify-center">
          <Link 
            to="/how-it-works" 
            className="text-sm text-[#718096] hover:text-[#2D3748] flex items-center gap-1 underline"
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
      {stripeIncomplete && (
        <div className="flex items-center gap-2 mb-4 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
          {/* For desktop, use tooltip */}
          <div className="hidden sm:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <LockKeyhole size={20} className="text-amber-500 flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] bg-white p-3 text-sm">
                   <p>Complete your Stripe account setup to activate your books for readers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* For mobile, use popover with click */}
          <div className="sm:hidden">
            <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger asChild>
                <LockKeyhole size={20} className="text-amber-500 flex-shrink-0 cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="w-screen max-w-[250px] bg-white p-3 text-sm">
                <p>Complete your Stripe account setup to activate your books for readers.</p>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="text-amber-700 text-sm">
            Your books won't be active for readers until you complete your Stripe account setup.
          </div>
        </div>
      )}
      
      <div className={stripeIncomplete ? 'opacity-75' : ''}>
        {qrCodes.map(qrCode => (
          <QRCodeItem 
            key={qrCode.id} 
            qrCode={qrCode} 
          />
        ))}
      </div>
    </div>
  );
};
