
import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const imgRef = useRef<HTMLImageElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image size should be less than 5MB");
        resolve(false);
        return;
      }

      // Check file type
      if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
        setImageError("Only JPEG, PNG and WebP images are supported");
        resolve(false);
        return;
      }

      // Create an image object to test if it loads properly
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // Check dimensions (max 2000x2000)
        if (img.width > 2000 || img.height > 2000) {
          setImageError("Image dimensions should be less than 2000x2000 pixels");
          URL.revokeObjectURL(objectUrl);
          resolve(false);
          return;
        }
        
        setImagePreviewUrl(objectUrl);
        setImageError(null);
        resolve(true);
      };
      
      img.onerror = () => {
        setImageError("The image could not be loaded. Please try another image.");
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };
      
      img.src = objectUrl;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);
    
    if (file) {
      const isValid = await validateImage(file);
      if (!isValid) {
        e.target.value = ''; // Reset the input
      }
    } else {
      setImagePreviewUrl(null);
      setImageError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Final validation for the image if it exists
      if (coverImage && imageError) {
        throw new Error(imageError);
      }

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

      toast({
        title: "Success",
        description: "Book information saved. Proceeding to QR code design.",
      });

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
    <Card className="p-6 shadow-md bg-white">
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div className="space-y-2">
          <label className="text-sm font-medium">Book Title*</label>
          <Input
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Enter your book's title"
            required
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Publisher*</label>
          <Input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Enter the publisher's name"
            required
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ISBN*</label>
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
            accept="image/jpeg, image/png, image/webp"
            onChange={handleImageChange}
            className="text-left"
          />
          {imageError && (
            <div className="flex items-center text-red-500 text-xs mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {imageError}
            </div>
          )}
          {imagePreviewUrl && !imageError && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <img 
                ref={imgRef}
                src={imagePreviewUrl} 
                alt="Cover preview" 
                className="w-24 h-36 object-cover rounded border"
                onError={() => setImageError("Failed to display image. Please try another one.")}
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">Recommended size: 600x900 pixels. Maximum size: 5MB.</p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || !!imageError} 
          className="w-full text-center bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] py-5 h-auto font-medium"
        >
          {isLoading ? "Processing..." : "Configure QR Code"}
        </Button>
      </form>
    </Card>
  );
};
