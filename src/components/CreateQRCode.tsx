
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateQRCodeProps {
  authorId: string;
}

export const CreateQRCode = ({ authorId }: CreateQRCodeProps) => {
  const navigate = useNavigate();
  const [bookTitle, setBookTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let coverImageUrl = null;
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('covers')
          .upload(filePath, coverImage);

        if (uploadError) {
          if (uploadError.message.includes('duplicate')) {
            throw new Error('A QR code with this ISBN already exists');
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(filePath);

        coverImageUrl = publicUrl;
      }

      // Create a record in the qr_codes table first
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert({
          author_id: authorId,
          book_title: bookTitle,
          publisher,
          isbn,
          release_date: releaseDate?.toISOString(),
          cover_image: coverImageUrl,
          qr_code_status: 'pending'
        })
        .select()
        .single();

      if (qrError) {
        if (qrError.message.includes('qr_codes_isbn_unique')) {
          throw new Error('A QR code with this ISBN already exists');
        }
        throw qrError;
      }

      // Navigate to the QR code design page with the created record
      navigate('/author/qr-design', {
        state: {
          qrCodeData: qrCode
        }
      });
    } catch (error: any) {
      console.error("Error preparing QR code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to prepare QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-2">
          <label className="text-sm font-medium">Book Title</label>
          <Input
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Enter your book's title"
            required
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Publisher</label>
          <Input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Enter the publisher's name"
            required
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ISBN</label>
          <Input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="Enter ISBN number"
            required
            className="text-left"
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
          <label className="text-sm font-medium">Cover Image (Optional)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="text-left"
          />
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full text-center">
          {isLoading ? "Processing..." : "Configure QR Code"}
        </Button>
      </form>
    </Card>
  );
};
