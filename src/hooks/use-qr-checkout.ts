
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QRCheckoutProps {
  qrCodeId: string | undefined;
  bookTitle: string | undefined;
}

export const useQRCheckout = ({ qrCodeId, bookTitle }: QRCheckoutProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!qrCodeId) {
      toast({
        title: "Error",
        description: "QR code data is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      
      console.log(`Processing checkout for QR code ${qrCodeId}`);
      
      const { data, error } = await supabase.functions.invoke('create-qr-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          qrCodeId,
          bookTitle
        }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.url) {
        throw new Error('No checkout URL received');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Unable to complete the checkout process.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  return {
    isCheckingOut,
    handleCheckout
  };
};
