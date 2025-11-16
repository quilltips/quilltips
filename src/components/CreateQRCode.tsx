
import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle, Loader2, ImagePlus, ChevronDown, Plus, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookCoverUpload } from "./qr/BookCoverUpload";
import { VideoUpload } from "./upload/VideoUpload";
import { CharacterImageUpload } from "./upload/CharacterImageUpload";
import { z } from "zod";

interface CreateQRCodeProps {
  authorId: string;
}

// Validation schema
const urlSchema = z.string().url().or(z.literal(""));
const characterSchema = z.object({
  url: z.string().url({ message: "Invalid image URL" }),
  name: z.string().min(1, { message: "Character name is required" }).max(100),
  description: z.string().max(500).optional(),
});

interface Character {
  url: string;
  name: string;
  description?: string;
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

  // Enhancement fields
  const [isEnhancementsOpen, setIsEnhancementsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [enhancementErrors, setEnhancementErrors] = useState<Record<string, string>>({});

  const addCharacter = () => {
    setCharacters([...characters, { url: "", name: "", description: "" }]);
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const validateEnhancements = () => {
    const errors: Record<string, string> = {};

    // Validate video URL if provided
    if (videoUrl) {
      const result = urlSchema.safeParse(videoUrl);
      if (!result.success) {
        errors.videoUrl = "Please enter a valid video URL";
      }
    }

    // Validate video thumbnail if provided
    if (videoThumbnail) {
      const result = urlSchema.safeParse(videoThumbnail);
      if (!result.success) {
        errors.videoThumbnail = "Please enter a valid thumbnail URL";
      }
    }

    // Validate characters
    characters.forEach((char, index) => {
      if (char.url || char.name || char.description) {
        const result = characterSchema.safeParse(char);
        if (!result.success) {
          result.error.errors.forEach((err) => {
            errors[`character_${index}_${err.path[0]}`] = err.message;
          });
        }
      }
    });

    setEnhancementErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (imageError) throw new Error(imageError);

      // Validate enhancements if any are filled
      if (isEnhancementsOpen && !validateEnhancements()) {
        throw new Error("Please fix the errors in the enhancements section");
      }

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

      // Filter out incomplete characters
      const validCharacters = characters.filter(
        (char) => char.url && char.name
      );

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
          qr_code_status: 'pending',
          // Enhancement fields
          thank_you_video_url: videoUrl || null,
          thank_you_video_thumbnail: videoThumbnail || null,
          video_title: videoTitle || null,
          video_description: videoDescription || null,
          book_description: bookDescription || null,
          character_images: validCharacters.length > 0 ? (validCharacters as any) : null,
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

        {/* Enhancements Section */}
        <Collapsible open={isEnhancementsOpen} onOpenChange={setIsEnhancementsOpen} className="border rounded-lg p-4 bg-muted/30">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full flex items-center justify-between hover:bg-transparent p-0"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-base font-semibold">Book Enhancements (Optional)</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  isEnhancementsOpen && "transform rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 mt-4">
            <p className="text-sm text-muted-foreground">
              Add extra content to make your book page more engaging for readers
            </p>

            {/* Thank You Video */}
            <div className="space-y-4 p-4 border rounded-lg bg-background">
              <h4 className="font-semibold text-sm">Thank You Video</h4>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Video</TabsTrigger>
                  <TabsTrigger value="url">Enter URL</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Video File</label>
                    <VideoUpload
                      onUploadSuccess={(url) => setVideoUrl(url)}
                      currentVideoUrl={videoUrl}
                      onRemove={() => setVideoUrl("")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Video Title (optional)</label>
                    <Input
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Thank you for reading!"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Video Description (optional)</label>
                    <Textarea
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="A special message..."
                      rows={2}
                      maxLength={500}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="url" className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Video URL</label>
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://..."
                      type="url"
                    />
                    {enhancementErrors.videoUrl && (
                      <p className="text-xs text-red-500">{enhancementErrors.videoUrl}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Thumbnail URL (optional)</label>
                    <Input
                      value={videoThumbnail}
                      onChange={(e) => setVideoThumbnail(e.target.value)}
                      placeholder="https://..."
                      type="url"
                    />
                    {enhancementErrors.videoThumbnail && (
                      <p className="text-xs text-red-500">{enhancementErrors.videoThumbnail}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Video Title (optional)</label>
                    <Input
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Thank you for reading!"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Video Description (optional)</label>
                    <Textarea
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="A special message..."
                      rows={2}
                      maxLength={500}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Book Description */}
            <div className="space-y-4 p-4 border rounded-lg bg-background">
              <h4 className="font-semibold text-sm">Book Description</h4>
              <div className="space-y-2">
                <Textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Enter a detailed description of your book..."
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  {bookDescription.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Character Gallery */}
            <div className="space-y-4 p-4 border rounded-lg bg-background">
              <h4 className="font-semibold text-sm">Character Gallery</h4>
              <div className="space-y-3">
                {characters.map((char, idx) => (
                  <div key={idx} className="p-3 border rounded-md space-y-3 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Character {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCharacter(idx)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Character name"
                        value={char.name}
                        onChange={(e) => updateCharacter(idx, "name", e.target.value)}
                        maxLength={100}
                      />
                      {enhancementErrors[`character_${idx}_name`] && (
                        <p className="text-xs text-red-500">
                          {enhancementErrors[`character_${idx}_name`]}
                        </p>
                      )}
                    </div>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload Image</TabsTrigger>
                        <TabsTrigger value="url">Enter URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="space-y-2">
                        <CharacterImageUpload
                          onUploadSuccess={(url) => updateCharacter(idx, "url", url)}
                          currentImageUrl={char.url}
                          onRemove={() => updateCharacter(idx, "url", "")}
                          characterName={char.name}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="space-y-2">
                        <Input
                          placeholder="Image URL"
                          value={char.url}
                          onChange={(e) => updateCharacter(idx, "url", e.target.value)}
                          type="url"
                        />
                        {enhancementErrors[`character_${idx}_url`] && (
                          <p className="text-xs text-red-500">
                            {enhancementErrors[`character_${idx}_url`]}
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Description (optional)"
                        value={char.description || ""}
                        onChange={(e) => updateCharacter(idx, "description", e.target.value)}
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCharacter}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Character
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">
              Note: Book recommendations can be added later from your dashboard
            </p>
          </CollapsibleContent>
        </Collapsible>

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
