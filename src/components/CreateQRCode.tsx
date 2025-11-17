
import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle, Loader2, ImagePlus, ChevronDown, Plus, X, Sparkles, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  description: z.string().max(500).optional(),
});

interface Character {
  url: string;
  description?: string;
}

interface Recommendation {
  recommended_book_title: string;
  buy_link?: string;
  display_order: number;
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
  const [bookDescription, setBookDescription] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [enhancementErrors, setEnhancementErrors] = useState<Record<string, string>>({});

  const addCharacter = () => {
    setCharacters([...characters, { url: "", description: "" }]);
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const addRecommendation = () => {
    setRecommendations([
      ...recommendations,
      {
        recommended_book_title: "",
        buy_link: "",
        display_order: recommendations.length,
      },
    ]);
  };

  const updateRecommendation = (index: number, field: keyof Recommendation, value: string | number) => {
    const updated = [...recommendations];
    updated[index] = { ...updated[index], [field]: value };
    setRecommendations(updated);
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
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

    // Validate characters
    characters.forEach((char, index) => {
      if (char.url || char.description) {
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

      // Filter out characters without URLs (empty characters)
      const validCharacters = characters.filter(
        (char) => char.url && char.url.trim() !== ""
      );

      // Filter out recommendations without book titles
      const validRecommendations = recommendations.filter(
        (rec) => rec.recommended_book_title && rec.recommended_book_title.trim() !== ""
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

      // Save recommendations if any were provided
      if (validRecommendations.length > 0) {
        const recommendationsToInsert = validRecommendations.map((rec, idx) => ({
          author_id: authorId,
          qr_code_id: qrCode.id,
          recommended_book_title: rec.recommended_book_title,
          recommended_book_author: "", // Empty string as default since we're simplifying the form
          buy_link: rec.buy_link || null,
          display_order: idx,
        }));

        const { error: recError } = await supabase
          .from('author_book_recommendations')
          .insert(recommendationsToInsert);

        if (recError) {
          console.error("Error saving recommendations:", recError);
          // Don't throw - recommendations are optional, continue with navigation
        }
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
        <Collapsible open={isEnhancementsOpen} onOpenChange={setIsEnhancementsOpen} className=" rounded-lg p-4 bg-muted/30">
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
            {/* Thank You Video */}
            <div className="space-y-4 p-4 border rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="font-semibold text-xs md:text-sm" style={{ color: '#ffd166' }}>Thank You Video</h4>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" style={{ color: '#333333' }} className="data-[state=active]:bg-[#ffd166] data-[state=active]:text-[#19363c]">Upload Video</TabsTrigger>
                <TabsTrigger value="url" style={{ color: '#333333' }} className="data-[state=active]:bg-[#ffd166] data-[state=active]:text-[#19363c]">Enter URL</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium" style={{ color: '#333333' }}>Video File</label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help" style={{ color: '#333333' }} />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px]">
                            <p>Supported formats: MP4, WebM, OGG, MOV (max 100MB)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <VideoUpload
                      onUploadSuccess={(url) => setVideoUrl(url)}
                      currentVideoUrl={videoUrl}
                      onRemove={() => setVideoUrl("")}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="url" className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium" style={{ color: '#333333' }}>Video URL</label>
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://..."
                      type="url"
                      className="bg-white text-[#19363c]"
                    />
                    {enhancementErrors.videoUrl && (
                      <p className="text-xs text-red-400">{enhancementErrors.videoUrl}</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Book Description */}
            <div className="space-y-4 p-4 border rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="font-semibold text-xs md:text-sm" style={{ color: '#ffd166' }}>Book Description</h4>
              <div className="space-y-2">
                <Textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Enter a detailed description of your book..."
                  rows={4}
                  maxLength={2000}
                  className="bg-white text-[#19363c]"
                />
                <p className="text-xs" style={{ color: '#333333' }}>
                  {bookDescription.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Character Art */}
            <div className="space-y-4 p-4 border rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="font-semibold text-xs md:text-sm" style={{ color: '#ffd166' }}>Character Art</h4>
              <div className="space-y-3">
                {characters.map((char, idx) => (
                  <div key={idx} className="p-3 border rounded-md space-y-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCharacter(idx)}
                        className="h-6 w-6 p-0"
                        style={{ color: '#333333' }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" style={{ color: '#333333' }} className="data-[state=active]:bg-[#ffd166] data-[state=active]:text-[#19363c]">Upload Image</TabsTrigger>
                      <TabsTrigger value="url" style={{ color: '#333333' }} className="data-[state=active]:bg-[#ffd166] data-[state=active]:text-[#19363c]">Enter URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="space-y-2">
                        <CharacterImageUpload
                          onUploadSuccess={(url) => updateCharacter(idx, "url", url)}
                          currentImageUrl={char.url}
                          onRemove={() => updateCharacter(idx, "url", "")}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="space-y-2">
                        <Input
                          placeholder="Image URL"
                          value={char.url}
                          onChange={(e) => updateCharacter(idx, "url", e.target.value)}
                          type="url"
                          className="bg-white text-[#19363c]"
                        />
                        {enhancementErrors[`character_${idx}_url`] && (
                          <p className="text-xs text-red-400">
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
                        className="bg-white text-[#19363c]"
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
                  style={{ borderColor: '#333333', color: '#333333' }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Character
                </Button>
              </div>
            </div>

            {/* Book Recommendations */}
            <div className="space-y-4 p-4 border rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="font-semibold text-xs md:text-sm" style={{ color: '#ffd166' }}>Book Recommendations</h4>
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecommendation(idx)}
                        className="h-6 w-6 p-0"
                        style={{ color: '#333333' }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`book-title-${idx}`} className="text-lg font-medium" style={{ color: '#333333' }}>Book title</Label>
                      <Input
                        id={`book-title-${idx}`}
                        value={rec.recommended_book_title}
                        onChange={(e) => updateRecommendation(idx, "recommended_book_title", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border bg-white text-[#19363c] focus:ring-2 focus:ring-[#ffd166]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`buy-link-${idx}`} className="text-lg font-medium" style={{ color: '#333333' }}>Buy link (Amazon, Goodreads, etc.)</Label>
                      <Input
                        id={`buy-link-${idx}`}
                        value={rec.buy_link || ""}
                        onChange={(e) => updateRecommendation(idx, "buy_link", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border bg-white text-[#19363c] focus:ring-2 focus:ring-[#ffd166]"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRecommendation}
                  className="w-full"
                  style={{ borderColor: '#333333', color: '#333333' }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Recommendation
                </Button>
              </div>
            </div>
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
