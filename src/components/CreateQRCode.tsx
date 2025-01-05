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
      // Create QR code record
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert([
          { author_id: authorId, book_title: bookTitle }
        ])
        .select()
        .single();

      if (qrError) throw qrError;

      // Create Stripe checkout session
      const { data: { url }, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
        body: { qrCodeId: qrCode.id }
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      window.location.href = url;

      setBookTitle("");
    } catch (error) {
      console.error("Error creating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to create QR code",
        variant: "destructive",
      });
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
          Create QR Code (${9.99})
        </Button>
      </form>
    </Card>
  );
};