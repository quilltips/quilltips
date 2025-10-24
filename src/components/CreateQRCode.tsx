
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
import { CalendarIcon, AlertCircle, Loader2, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookCoverUpload } from "./qr/BookCoverUpload";

interface CreateQRCodeProps {
  authorId: string;
}

export const CreateQRCode = ({ authorId }: CreateQRCodeProps) => {
  const navigate = useNavigate();
  const [bookTitle, setBookTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [buyNowLink, setBuyNowLink] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (imageError) throw new Error(imageError);

      // Process buy now link to ensure it has a protocol
      let processedBuyNowLink = buyNowLink;
      if (buyNowLink && !buyNowLink.match(/^https?:\/\//)) {
        processedBuyNowLink = `https://${buyNowLink}`;
      }

      // Ensure the user has a public_profiles record before creating QR code
      const { data: existingPublicProfile, error: profileCheckError } = await supabase
        .from('public_profiles')
        .select('id')
        .eq('id', authorId)
        .maybeSingle();

      if (profileCheckError) {
        console.error("Error checking public profile:", profileCheckError);
        throw new Error("Failed to verify author profile");
      }

      // If no public profile exists, create one
      if (!existingPublicProfile) {
        console.log("Creating public profile for author:", authorId);
        const { error: createProfileError } = await supabase
          .from('public_profiles')
          .insert({
            id: authorId,
            name: 'New Author', // Will be updated when user completes profile
            bio: null,
            avatar_url: null,
            social_links: null,
            slug: null,
            stripe_account_id: null,
            stripe_setup_complete: false
          });

        if (createProfileError) {
          console.error("Error creating public profile:", createProfileError);
          throw new Error("Failed to create author profile");
        }
      }

      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert({
          author_id: authorId,
          book_title: bookTitle.trim(),
          publisher,
          isbn,
          release_date: releaseDate?.toISOString(),
          cover_image: coverImageUrl,
          buy_now_link: processedBuyNowLink || null,
          qr_code_status: 'pending'
        })
        .select()
        .single();

      if (qrError) {
        console.error("QR code creation error:", qrError);
        if (qrError.message.includes('qr_codes_isbn_unique')) {
          throw new Error('A QR code with this ISBN already exists');
        }
        throw qrError;
      }

      toast({
        title: "Success",
        description: "Book information saved. Proceeding to QR code design.",
      });

      navigate('/author/qr-design', {
        state: { qrCodeData: qrCode }
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
    <Card className="p-6 shadow-none bg-transparent">
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div className="space-y-2">
          <label className="text-sm font-medium">Enter the book title</label>
          <Input
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder=""
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter the publisher</label>
          <Input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder=""
            required
          />
        </div>

       

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter release date (optional)</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "border border-[#333333] rounded-md w-full justify-start text-left font-normal hover:bg-transparent hover:shadow-none",
                  !releaseDate && ""
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {releaseDate ? format(releaseDate, "PPP") : <span></span>}
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
          <label className="text-sm font-medium">Enter the ISBN</label>
          <Input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder=""
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Buy Now Link (Optional)</label>
          <Input
            value={buyNowLink}
            onChange={(e) => setBuyNowLink(e.target.value)}
            placeholder=""
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image (optional)</label>
          <div className="relative aspect-[2/3] max-w-[150px] border rounded-2xl overflow-hidden bg-white">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt="Book cover preview"
                className="w-full h-full object-cover"
                onError={() => setImageError("Could not load preview")}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Upload your book cover</p>
              </div>
            )}
            <BookCoverUpload
              bookTitle={bookTitle || "book"}
              onUploadSuccess={(url) => {
                setCoverImageUrl(url);
                setImageError(null);
              }}
            />
          </div>
          {imageError && (
            <p className="text-xs text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {imageError}
            </p>
          )}
          <p className="text-sm pt-1 pb-4 ">
            Recommended size: 600×900 pixels. Max: 10MB.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !!imageError}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] py-5 h-auto font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Next"
          )}
        </Button>
      </form>
    </Card>
  );
};
