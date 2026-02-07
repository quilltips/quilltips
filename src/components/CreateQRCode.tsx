
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon, AlertCircle, Loader2, ImagePlus, Plus, X, HelpCircle } from "lucide-react";
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



export const CreateQRCode = ({ authorId }: CreateQRCodeProps) => {
  const navigate = useNavigate();
  const [bookTitle, setBookTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [releaseDateInput, setReleaseDateInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [buyNowLink, setBuyNowLink] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Enhancement fields
  type BonusSection = "videos" | "letter" | "characters" | "signups";
  const [openSections, setOpenSections] = useState<BonusSection[]>([]);
  const [videos, setVideos] = useState<BookVideo[]>([]);
  const [bookDescription, setBookDescription] = useState("");
  const [letterToReaders, setLetterToReaders] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [enhancementErrors, setEnhancementErrors] = useState<Record<string, string>>({});
  
  // Signup form toggles
  const [arcSignupEnabled, setArcSignupEnabled] = useState(false);
  const [betaReaderEnabled, setBetaReaderEnabled] = useState(false);
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);

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
      // Validate enhancements if any content sections are open
      if (openSections.length > 0 && !validateEnhancements()) {
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
          letter_to_readers: letterToReaders || null,
          character_images: validCharacters.length > 0 ? (validCharacters as any) : null,
          arc_signup_enabled: arcSignupEnabled,
          beta_reader_enabled: betaReaderEnabled,
          newsletter_enabled: newsletterEnabled,
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
            className="border border-[#333333] bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter the publisher</label>
          <Input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder=""
            required
            className="border border-[#333333] bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter the ISBN</label>
          <Input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder=""
            required
            className="border border-[#333333] bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter release date (optional)</label>
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex border border-[#333333] rounded-md bg-white overflow-hidden">
                <div className="flex items-center pl-3 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <Input
                  value={releaseDateInput}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                    if (v.length >= 5) v = v.slice(0, 5) + "/" + v.slice(5);
                    if (v.length > 10) v = v.slice(0, 10);
                    setReleaseDateInput(v);
                    const parsed = parse(v, "MM/dd/yyyy", new Date());
                    if (isValid(parsed)) setReleaseDate(parsed);
                    else if (!v) setReleaseDate(undefined);
                  }}
                  placeholder="MM/DD/YYYY"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b">
                <Input
                  value={releaseDateInput}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                    if (v.length >= 5) v = v.slice(0, 5) + "/" + v.slice(5);
                    if (v.length > 10) v = v.slice(0, 10);
                    setReleaseDateInput(v);
                    const parsed = parse(v, "MM/dd/yyyy", new Date());
                    if (isValid(parsed)) setReleaseDate(parsed);
                    else if (!v) setReleaseDate(undefined);
                  }}
                  placeholder="MM/DD/YYYY"
                  className="border border-[#333333] bg-white"
                />
              </div>
              <Calendar
                mode="single"
                selected={releaseDate}
                onSelect={(date) => {
                  setReleaseDate(date);
                  setReleaseDateInput(date ? format(date, "MM/dd/yyyy") : "");
                }}
                defaultMonth={releaseDate ?? new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Buy Now Link (Optional)</label>
          <Input
            value={buyNowLink}
            onChange={(e) => setBuyNowLink(e.target.value)}
            placeholder=""
            type="text"
            className="border border-[#333333] bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Book Description (optional)</label>
          <Textarea
            value={bookDescription}
            onChange={(e) => setBookDescription(e.target.value)}
            placeholder=""
            maxLength={2000}
            className="min-h-[80px] text-sm border border-[#333333] bg-white"
          />
          <p className="text-xs text-gray-500">{bookDescription.length}/2000 characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image (optional)</label>
          <div className="relative aspect-[2/3] max-w-[150px] border border-[#333333] rounded-2xl overflow-hidden bg-white">
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

        {/* Add Content To Your Book Page - tile-based UI */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#333333]">Add Content To Your Book Page</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px]">
                  <p className="text-xs">Enhance your book page with bonus content for readers. Add videos, book art, a personal letter, or enable signup forms to grow your audience.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Horizontal content tiles */}
          <div className="flex flex-wrap gap-3">
            {([
              { key: "videos" as BonusSection, label: "Videos" },
              { key: "characters" as BonusSection, label: "Book Art" },
              { key: "letter" as BonusSection, label: "Letter to Readers" },
              { key: "signups" as BonusSection, label: "Signup Forms" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setOpenSections(prev =>
                    prev.includes(key)
                      ? prev.filter(s => s !== key)
                      : [key, ...prev]
                  );
                }}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border bg-white hover:border-[#FFD166] hover:shadow-sm transition-all min-w-[90px] ${
                  openSections.includes(key) ? 'border-[#FFD166] shadow-sm' : 'border-gray-200'
                }`}
              >
                <span className="text-sm font-medium text-[#333333]">{label}</span>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD166] text-[#333333] transition-colors">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </div>
              </button>
            ))}
          </div>

          {/* Expanded sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openSections.map(section => {
              switch (section) {
                case "videos":
                  return (
                    <div key="videos" className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[#333333]">Videos</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpenSections(prev => prev.filter(s => s !== "videos"))} className="h-6 w-6 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {videos.map((video, idx) => (
                        <div key={idx} className="p-3 rounded-lg space-y-3 bg-gray-50 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-[#333333]">Video {idx + 1}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeVideo(idx)} className="h-6 w-6 p-0 hover:bg-transparent text-[#333333]">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-8">
                              <TabsTrigger value="upload" className="text-xs text-[#333333] data-[state=active]:bg-[#19363c] data-[state=active]:text-white">Upload</TabsTrigger>
                              <TabsTrigger value="url" className="text-xs text-[#333333] data-[state=active]:bg-[#19363c] data-[state=active]:text-white">URL</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="mt-2">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-xs text-[#333333]">Video File</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 cursor-help text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[200px]"><p className="text-xs">MP4, WebM, OGG, MOV (max 225MB)</p></TooltipContent>
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
                                className="h-8 text-xs"
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
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addVideo} className="w-full h-9 text-xs border-dashed border-[#FFD166] text-[#333333] hover:bg-[#FFD166]/10">
                        <Plus className="mr-1.5 h-3 w-3" /> Add Video
                      </Button>
                    </div>
                  );

                case "characters":
                  return (
                    <div key="characters" className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[#333333]">Book Art</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpenSections(prev => prev.filter(s => s !== "characters"))} className="h-6 w-6 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {characters.map((char, idx) => (
                        <div key={idx} className="p-3 rounded-lg space-y-2 bg-gray-50 border border-gray-200">
                          <div className="flex justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeCharacter(idx)} className="h-6 w-6 p-0 hover:bg-transparent text-[#333333]"><X className="h-3 w-3" /></Button>
                          </div>
                          <CharacterImageUpload
                            onUploadSuccess={(url) => updateCharacter(idx, "url", url)}
                            currentImageUrl={char.url}
                            onRemove={() => updateCharacter(idx, "url", "")}
                          />
                          <Textarea
                            placeholder="Description (optional)"
                            value={char.description || ""}
                            onChange={(e) => updateCharacter(idx, "description", e.target.value)}
                            rows={2}
                            className="text-xs"
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addCharacter} className="w-full h-9 text-xs border-dashed border-[#FFD166] text-[#333333] hover:bg-[#FFD166]/10">
                        <Plus className="mr-1.5 h-3 w-3" /> Add Art
                      </Button>
                    </div>
                  );

                case "letter":
                  return (
                    <div key="letter" className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[#333333]">Letter to Readers</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpenSections(prev => prev.filter(s => s !== "letter"))} className="h-6 w-6 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Write a personal note to your readers..."
                        value={letterToReaders}
                        onChange={(e) => setLetterToReaders(e.target.value)}
                        className="min-h-[120px] text-sm"
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500">{letterToReaders.length}/2000 characters</p>
                    </div>
                  );

                case "signups":
                  return (
                    <div key="signups" className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[#333333]">Signup Forms</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpenSections(prev => prev.filter(s => s !== "signups"))} className="h-6 w-6 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">Enable signup forms on this book page. Signups appear in your author dashboard.</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="create-arc-signup" className="text-sm cursor-pointer text-[#333333]">ARC Reader Signup</Label>
                          <Switch id="create-arc-signup" checked={arcSignupEnabled} onCheckedChange={setArcSignupEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="create-beta-signup" className="text-sm cursor-pointer text-[#333333]">Beta Reader Signup</Label>
                          <Switch id="create-beta-signup" checked={betaReaderEnabled} onCheckedChange={setBetaReaderEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="create-newsletter-signup" className="text-sm cursor-pointer text-[#333333]">Newsletter Signup</Label>
                          <Switch id="create-newsletter-signup" checked={newsletterEnabled} onCheckedChange={setNewsletterEnabled} />
                        </div>
                      </div>
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
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
