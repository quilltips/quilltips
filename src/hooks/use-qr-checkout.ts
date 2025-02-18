
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseQRCheckoutProps {
  qrCodeId: string;
  bookTitle: string;
}

export const useQRCheckout = ({ qrCodeId, bookTitle }: UseQRCheckoutProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      console.log('Starting checkout process for QR code:', qrCodeId);

      const { data: checkoutResponse, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
        body: { qrCodeId, bookTitle }
      });

      if (checkoutError) throw checkoutError;
      if (!checkoutResponse?.url) throw new Error("No checkout URL returned");

      console.log('Redirecting to checkout:', checkoutResponse.url);
      window.location.href = checkoutResponse.url;
    } catch (error: any) {
      console.error("Error in checkout process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    isCheckingOut,
    handleCheckout
  };
};
