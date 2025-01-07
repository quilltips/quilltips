import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateQRCodeProps {
  authorId: string;
}

export const CreateQRCode = ({ authorId }: CreateQRCodeProps) => {
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Creating QR code for author:", authorId);
      
      // Create QR code record
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert([
          { author_id: authorId, book_title: bookTitle }
        ])
        .select()
        .single();

      if (qrError) {
        console.error("QR code creation error:", qrError);
        throw qrError;
      }

      console.log("QR code created:", qrCode);

      // Create Stripe checkout session
      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          qrCodeId: qrCode.id,
          bookTitle: bookTitle
        }
      });

      if (checkoutError) {
        console.error("Checkout error:", checkoutError);
        throw checkoutError;
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      console.log("Redirecting to checkout:", data.url);
      window.location.href = data.url;

    } catch (error: any) {
      console.error("Error creating QR code:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create QR code",
        variant: "destructive",
      });
      
      // Clean up the QR code if checkout fails
      if (error?.message?.includes("checkout")) {
        await supabase
          .from('qr_codes')
          .delete()
          .eq('author_id', authorId)
          .eq('book_title', bookTitle);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Book Title
          </label>
          <Input
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Enter your book's title"
            required
          />
        </div>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create QR Code ($9.99)"}
        </Button>
      </form>
    </Card>
  );
};