import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface CreateQRCodeProps {
  authorId: string;
}

export const CreateQRCode = ({ authorId }: CreateQRCodeProps) => {
  const [bookTitle, setBookTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('covers')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let coverImageUrl = null;
      if (coverImage) {
        coverImageUrl = await handleImageUpload(coverImage);
      }

      console.log("Creating QR code for author:", authorId);
      
      // Create QR code record
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert([
          { 
            author_id: authorId, 
            book_title: bookTitle,
            publisher,
            isbn,
            release_date: releaseDate?.toISOString(),
            cover_image: coverImageUrl
          }
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
          <label className="text-sm font-medium">Book Title</label>
          <Input
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Enter your book's title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Publisher</label>
          <Input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Enter the publisher's name"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ISBN</label>
          <Input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="Enter ISBN number"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Release Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !releaseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {releaseDate ? format(releaseDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={releaseDate}
                onSelect={setReleaseDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            required
          />
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating..." : "Create QR Code ($9.99)"}
        </Button>
      </form>
    </Card>
  );
};