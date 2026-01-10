
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface BookVideo {
  url: string;
  type: "thank-you" | "interview" | "other";
  description?: string;
}

interface Recommendation {
  recommended_book_title: string;
  recommended_book_author?: string;
  buy_link?: string;
  display_order: number;
}

const VIDEO_TYPE_OPTIONS = [
  { value: "thank-you", label: "Thank-You Video" },
  { value: "interview", label: "Interview" },
  { value: "other", label: "Other" },
] as const;

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
  const [videos, setVideos] = useState<BookVideo[]>([]);
  const [bookDescription, setBookDescription] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [enhancementErrors, setEnhancementErrors] = useState<Record<string, string>>({});

  // Video management functions
  const addVideo = () => {
    setVideos([...videos, { url: "", type: "thank-you" }]);
  };

  const updateVideo = (index: number, field: keyof BookVideo, value: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

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
        recommended_book_author: "",
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

    // Validate video URLs if provided
    videos.forEach((video, index) => {
      if (video.url) {
        const result = urlSchema.safeParse(video.url);
        if (!result.success) {
          errors[`video_${index}_url`] = "Please enter a valid video URL";
        }
      }
    });

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

      // Filter out videos without URLs
      const validVideos = videos.filter(v => v.url && v.url.trim() !== "");

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
          book_videos: validVideos.length > 0 ? validVideos as any : null,
          thank_you_video_url: validVideos.length > 0 ? validVideos[0].url : null, // Legacy field for backwards compatibility
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
          recommended_book_author: rec.recommended_book_author || "",
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
                <span className="text-base font-semibold">Bonus Content (Optional)</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  isEnhancementsOpen && "transform rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Videos Section */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="text-sm font-medium mb-3" style={{ color: '#ffd166' }}>Upload a video for your readers</h4>
              <div className="space-y-3">
                {videos.map((video, idx) => (
                  <div key={idx} className="p-3 rounded-md space-y-3" style={{ backgroundColor: '#f8f6f2' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium" style={{ color: '#333333' }}>Video {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideo(idx)}
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        style={{ color: '#333333' }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Video Type Selector */}
                    <RadioGroup
                      value={video.type}
                      onValueChange={(value) => updateVideo(idx, "type", value)}
                      className="flex flex-wrap gap-3"
                    >
                      {VIDEO_TYPE_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-1.5">
                          <RadioGroupItem value={option.value} id={`create-video-type-${idx}-${option.value}`} className="h-3 w-3" style={{ borderColor: '#333333' }} />
                          <Label htmlFor={`create-video-type-${idx}-${option.value}`} className="text-xs cursor-pointer" style={{ color: '#333333' }}>
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="upload" className="text-xs data-[state=active]:bg-[#19363c] data-[state=active]:text-[#ffd166]" style={{ color: '#333333' }}>Upload</TabsTrigger>
                        <TabsTrigger value="url" className="text-xs data-[state=active]:bg-[#19363c] data-[state=active]:text-[#ffd166]" style={{ color: '#333333' }}>URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-2">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-xs" style={{ color: '#333333' }}>Video File</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 cursor-help" style={{ color: '#666666' }} />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[200px]">
                                <p className="text-xs">MP4, WebM, OGG, MOV (max 150MB)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <VideoUpload
                          onUploadSuccess={(url) => updateVideo(idx, "url", url)}
                          currentVideoUrl={video.url}
                          onRemove={() => updateVideo(idx, "url", "")}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="mt-2">
                        <Input
                          value={video.url}
                          onChange={(e) => updateVideo(idx, "url", e.target.value)}
                          placeholder="https://..."
                          type="url"
                          className="h-8 text-xs bg-white border-gray-200"
                          style={{ color: '#333333' }}
                        />
                        {enhancementErrors[`video_${idx}_url`] && (
                          <p className="text-xs text-red-500 mt-1">{enhancementErrors[`video_${idx}_url`]}</p>
                        )}
                      </TabsContent>
                    </Tabs>
                    
                    <Input
                      placeholder="Description (optional)"
                      value={video.description || ""}
                      onChange={(e) => updateVideo(idx, "description", e.target.value)}
                      className="h-8 text-xs bg-white border-gray-200"
                      style={{ color: '#333333' }}
                    />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addVideo}
                  className="w-full h-8 text-xs border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffd166' }}
                >
                  <Plus className="mr-1.5 h-3 w-3" />
                  Add Video
                </Button>
              </div>
            </div>

            {/* Book Description */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="text-sm font-medium mb-3" style={{ color: '#ffd166' }}>Book Description</h4>
              <Textarea
                value={bookDescription}
                onChange={(e) => setBookDescription(e.target.value)}
                placeholder="Enter a detailed description of your book..."
                rows={4}
                maxLength={2000}
                className="text-sm bg-white border-gray-200 min-h-[100px]"
                style={{ color: '#333333' }}
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {bookDescription.length}/2000 characters
              </p>
            </div>

            {/* Character Art */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="text-sm font-medium mb-3" style={{ color: '#ffd166' }}>Character or Book Art</h4>
              <div className="space-y-3">
                {characters.map((char, idx) => (
                  <div key={idx} className="p-3 rounded-md space-y-2" style={{ backgroundColor: '#f8f6f2' }}>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCharacter(idx)}
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        style={{ color: '#333333' }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="upload" className="text-xs data-[state=active]:bg-[#19363c] data-[state=active]:text-[#ffd166]" style={{ color: '#333333' }}>Upload</TabsTrigger>
                        <TabsTrigger value="url" className="text-xs data-[state=active]:bg-[#19363c] data-[state=active]:text-[#ffd166]" style={{ color: '#333333' }}>URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-2">
                        <CharacterImageUpload
                          onUploadSuccess={(url) => updateCharacter(idx, "url", url)}
                          currentImageUrl={char.url}
                          onRemove={() => updateCharacter(idx, "url", "")}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="mt-2">
                        <Input
                          placeholder="Image URL"
                          value={char.url}
                          onChange={(e) => updateCharacter(idx, "url", e.target.value)}
                          type="url"
                          className="h-8 text-xs bg-white border-gray-200"
                          style={{ color: '#333333' }}
                        />
                        {enhancementErrors[`character_${idx}_url`] && (
                          <p className="text-xs text-red-500 mt-1">{enhancementErrors[`character_${idx}_url`]}</p>
                        )}
                      </TabsContent>
                    </Tabs>
                    <Textarea
                      placeholder="Description (optional)"
                      value={char.description || ""}
                      onChange={(e) => updateCharacter(idx, "description", e.target.value)}
                      rows={2}
                      maxLength={500}
                      className="text-xs bg-white border-gray-200"
                      style={{ color: '#333333' }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addCharacter}
                  className="w-full h-8 text-xs border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffd166' }}
                >
                  <Plus className="mr-1.5 h-3 w-3" />
                  Add Art
                </Button>
              </div>
            </div>

            {/* Book Recommendations */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#19363c' }}>
              <h4 className="text-sm font-medium mb-3" style={{ color: '#ffd166' }}>Book Recommendations</h4>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-md space-y-2" style={{ backgroundColor: '#f8f6f2' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: '#333333' }}>Book title</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecommendation(idx)}
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        style={{ color: '#333333' }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={rec.recommended_book_title}
                      onChange={(e) => updateRecommendation(idx, "recommended_book_title", e.target.value)}
                      className="h-8 text-xs bg-white border-gray-200"
                      style={{ color: '#333333' }}
                    />
                    <span className="text-xs font-medium block pt-1" style={{ color: '#333333' }}>Author name</span>
                    <Input
                      value={rec.recommended_book_author || ""}
                      onChange={(e) => updateRecommendation(idx, "recommended_book_author", e.target.value)}
                      className="h-8 text-xs bg-white border-gray-200"
                      style={{ color: '#333333' }}
                    />
                    <span className="text-xs font-medium block pt-1" style={{ color: '#333333' }}>Buy link</span>
                    <Input
                      value={rec.buy_link || ""}
                      onChange={(e) => updateRecommendation(idx, "buy_link", e.target.value)}
                      className="h-8 text-xs bg-white border-gray-200"
                      style={{ color: '#333333' }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addRecommendation}
                  className="w-full h-8 text-xs border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffd166' }}
                >
                  <Plus className="mr-1.5 h-3 w-3" />
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
