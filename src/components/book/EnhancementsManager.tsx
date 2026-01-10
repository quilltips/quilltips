import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoUpload } from "../upload/VideoUpload";
import { CharacterImageUpload } from "../upload/CharacterImageUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BookVideo } from "./VideoCarousel";

interface Character {
  url: string;
  description?: string;
}

interface Recommendation {
  id?: string;
  recommended_book_title: string;
  recommended_book_author?: string;
  buy_link?: string;
  display_order: number;
}

interface EnhancementsManagerProps {
  qrCodeId: string;
  authorId: string;
  initialData?: {
    thank_you_video_url?: string;
    book_description?: string;
    character_images?: Character[];
    book_videos?: BookVideo[];
  };
  recommendations?: Recommendation[];
  onUpdate?: () => void;
}

const VIDEO_TYPE_OPTIONS = [
  { value: "thank-you", label: "Thank-You Video" },
  { value: "interview", label: "Interview" },
  { value: "other", label: "Other" },
] as const;

export const EnhancementsManager = ({
  qrCodeId,
  authorId,
  initialData,
  recommendations = [],
  onUpdate,
}: EnhancementsManagerProps) => {
  const { toast } = useToast();
  
  // Initialize videos from book_videos or legacy thank_you_video_url
  const getInitialVideos = (): BookVideo[] => {
    if (initialData?.book_videos && Array.isArray(initialData.book_videos) && initialData.book_videos.length > 0) {
      return initialData.book_videos;
    }
    // Fallback to legacy single video
    if (initialData?.thank_you_video_url) {
      return [{ url: initialData.thank_you_video_url, type: "thank-you" }];
    }
    return [];
  };
  
  const [videos, setVideos] = useState<BookVideo[]>(getInitialVideos());
  const [bookDesc, setBookDesc] = useState(initialData?.book_description || "");
  const [characters, setCharacters] = useState<Character[]>(initialData?.character_images || []);
  const [recs, setRecs] = useState<Recommendation[]>(recommendations);
  const [isSaving, setIsSaving] = useState(false);
  const [isVideoSaving, setIsVideoSaving] = useState(false);
  const recommendationsRef = useRef<Recommendation[]>(recommendations);

  // Save videos to database
  const saveVideos = async (videosToSave: BookVideo[]) => {
    setIsVideoSaving(true);
    try {
      // Filter out videos without URLs
      const validVideos = videosToSave.filter(v => v.url && v.url.trim() !== "");
      
      const { error } = await supabase
        .from('qr_codes')
        .update({ 
          book_videos: validVideos.length > 0 ? validVideos as any : null,
          // Also update legacy field for backwards compatibility
          thank_you_video_url: validVideos.length > 0 ? validVideos[0].url : null
        })
        .eq('id', qrCodeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video saved successfully",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    } finally {
      setIsVideoSaving(false);
    }
  };

  // Handle video upload success - auto-save
  const handleVideoUploadSuccess = (index: number, url: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], url };
    setVideos(updated);
    saveVideos(updated);
  };

  // Handle video URL change (manual entry)
  const handleVideoUrlChange = (index: number, url: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], url };
    setVideos(updated);
  };

  // Handle video type change
  const handleVideoTypeChange = (index: number, type: BookVideo["type"]) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], type };
    setVideos(updated);
  };

  // Handle video description change
  const handleVideoDescriptionChange = (index: number, description: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], description };
    setVideos(updated);
  };

  // Handle video removal
  const handleVideoRemove = (index: number) => {
    const updated = videos.filter((_, i) => i !== index);
    setVideos(updated);
    saveVideos(updated);
  };

  // Add new video
  const addVideo = () => {
    setVideos([...videos, { url: "", type: "thank-you" }]);
  };

  // Save video URL (for manual URL entry)
  const saveVideoUrl = async (index: number) => {
    const updated = [...videos];
    if (updated[index]?.url) {
      saveVideos(updated);
    }
  };
  
  // Sync recommendations when prop changes
  useEffect(() => {
    if (recommendations !== undefined) {
      const currentIds = recommendations.map(r => r.id).filter(Boolean).sort().join(',');
      const prevIds = recommendationsRef.current?.map(r => r.id).filter(Boolean).sort().join(',') || '';
      
      const hasChanged = currentIds !== prevIds || 
                        (recommendationsRef.current === undefined && recommendations.length > 0) ||
                        (recommendationsRef.current?.length !== recommendations.length && recommendations.length > 0);
      
      if (hasChanged) {
        setRecs(prevRecs => {
          const localUnsavedItems = prevRecs.filter(r => !r.id);
          const merged = [...recommendations, ...localUnsavedItems];
          return merged;
        });
        recommendationsRef.current = recommendations;
      }
    }
  }, [recommendations]);
  
  // Sync initialData when it changes
  useEffect(() => {
    if (initialData) {
      // Sync videos
      const newVideos = getInitialVideos();
      setVideos(prevVideos => {
        // Preserve local unsaved videos (those without URLs or with new URLs not in saved data)
        const savedUrls = new Set(newVideos.map(v => v.url).filter(Boolean));
        const pendingVideos = prevVideos.filter(v => v.url && v.url.trim() !== "" && !savedUrls.has(v.url));
        const unsavedVideos = prevVideos.filter(v => !v.url || v.url.trim() === "");
        
        if (pendingVideos.length > 0 || unsavedVideos.length > 0) {
          return [...newVideos, ...pendingVideos, ...unsavedVideos];
        }
        return newVideos;
      });
      
      setBookDesc(initialData.book_description || "");
      // Sync characters
      setCharacters(prevChars => {
        const newChars = initialData.character_images || [];
        const savedUrls = new Set(newChars.map(c => c.url).filter(Boolean));
        const pendingChars = prevChars.filter(c => c.url && c.url.trim() !== "" && !savedUrls.has(c.url));
        const unsavedChars = prevChars.filter(c => !c.url || c.url.trim() === "");
        
        if (pendingChars.length > 0 || unsavedChars.length > 0) {
          return [...newChars, ...pendingChars, ...unsavedChars];
        }
        return newChars;
      });
    }
  }, [initialData]);

  const saveEnhancements = async () => {
    setIsSaving(true);
    try {
      const validCharacters = characters.filter(char => char.url && char.url.trim() !== "");
      const validVideos = videos.filter(v => v.url && v.url.trim() !== "");
      
      const { error } = await supabase
        .from('qr_codes')
        .update({
          book_videos: validVideos.length > 0 ? validVideos as any : null,
          thank_you_video_url: validVideos.length > 0 ? validVideos[0].url : null,
          book_description: bookDesc || null,
          character_images: validCharacters.length > 0 ? validCharacters as any : null,
        })
        .eq('id', qrCodeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Enhancements saved successfully",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error saving enhancements:", error);
      toast({
        title: "Error",
        description: "Failed to save enhancements",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
    setRecs(prevRecs => [
      ...prevRecs,
      {
        recommended_book_title: "",
        recommended_book_author: "",
        buy_link: "",
        display_order: prevRecs.length,
      },
    ]);
  };

  const updateRecommendation = (index: number, field: keyof Recommendation, value: string | number) => {
    const updated = [...recs];
    updated[index] = { ...updated[index], [field]: value };
    setRecs(updated);
  };

  const removeRecommendation = async (index: number) => {
    const rec = recs[index];
    if (rec.id) {
      try {
        const { error } = await supabase
          .from('author_book_recommendations')
          .delete()
          .eq('id', rec.id);

        if (error) throw error;
        toast({ title: "Success", description: "Recommendation removed" });
      } catch (error) {
        console.error("Error removing recommendation:", error);
        toast({ title: "Error", description: "Failed to remove recommendation", variant: "destructive" });
        return;
      }
    }
    setRecs(recs.filter((_, i) => i !== index));
  };

  const saveRecommendation = async (index: number) => {
    const rec = recs[index];
    try {
      if (rec.id) {
        const { error } = await supabase
          .from('author_book_recommendations')
          .update({
            recommended_book_title: rec.recommended_book_title,
            recommended_book_author: rec.recommended_book_author || "",
            buy_link: rec.buy_link || null,
            display_order: rec.display_order,
          })
          .eq('id', rec.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('author_book_recommendations')
          .insert({
            author_id: authorId,
            qr_code_id: qrCodeId,
            recommended_book_title: rec.recommended_book_title,
            recommended_book_author: rec.recommended_book_author || "",
            buy_link: rec.buy_link || null,
            display_order: rec.display_order,
          })
          .select()
          .single();

        if (error) throw error;
        const updated = [...recs];
        updated[index] = { ...rec, id: data.id };
        setRecs(updated);
      }

      toast({ title: "Success", description: "Recommendation saved" });
      onUpdate?.();
    } catch (error) {
      console.error("Error saving recommendation:", error);
      toast({ title: "Error", description: "Failed to save recommendation", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 md:space-y-6">
      {/* Video Section */}
      <Card className="border rounded-lg" style={{ backgroundColor: '#19363c' }}>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-sm md:text-base" style={{ color: '#ffd166' }}>Upload a video for your readers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {videos.map((video, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex justify-between items-start">
                <Label className="text-sm font-medium" style={{ color: '#ffd166' }}>Video {idx + 1}</Label>
                <Button variant="ghost" size="sm" onClick={() => handleVideoRemove(idx)} className="text-white hover:text-white h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Video Type Selector */}
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: '#333333' }}>Video Type</Label>
                <RadioGroup
                  value={video.type}
                  onValueChange={(value) => handleVideoTypeChange(idx, value as BookVideo["type"])}
                  className="flex flex-wrap gap-4"
                >
                  {VIDEO_TYPE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`video-type-${idx}-${option.value}`} className="border-white text-white" />
                      <Label htmlFor={`video-type-${idx}-${option.value}`} className="text-sm cursor-pointer" style={{ color: '#333333' }}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Tabs defaultValue={video.url && video.url.includes('/book-videos/') ? 'upload' : (video.url ? 'url' : 'upload')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" style={{ color: '#333333' }} className="data-[state=active]:bg-[#ffd166] data-[state=active]:text-[#19363c]">Upload Video</TabsTrigger>
                  <TabsTrigger value="url" style={{ color: '#333333' }} className="data-[state=active]:bg-[#ffd166] data-[state=active]:text-[#19363c]">Enter URL</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4 pt-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-xs font-medium" style={{ color: '#333333' }}>Video File</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 cursor-help" style={{ color: '#333333' }} />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px]">
                            <p>Supported formats: MP4, WebM, OGG, MOV (max 150MB)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <VideoUpload
                      onUploadSuccess={(url) => handleVideoUploadSuccess(idx, url)}
                      currentVideoUrl={video.url}
                      onRemove={() => {
                        const updated = [...videos];
                        updated[idx] = { ...updated[idx], url: "" };
                        setVideos(updated);
                      }}
                    />
                    {isVideoSaving && (
                      <p className="text-xs" style={{ color: '#ffd166' }}>Saving...</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="url" className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label style={{ color: '#333333' }}>Video URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://..."
                        value={video.url}
                        onChange={(e) => handleVideoUrlChange(idx, e.target.value)}
                        className="bg-white text-[#19363c] flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => saveVideoUrl(idx)}
                        disabled={isVideoSaving}
                        style={{ backgroundColor: '#ffd166', color: '#19363c' }}
                        className="hover:opacity-90"
                      >
                        {isVideoSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Video Description */}
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: '#333333' }}>Description (optional)</Label>
                <Input
                  placeholder="Brief description of this video..."
                  value={video.description || ""}
                  onChange={(e) => handleVideoDescriptionChange(idx, e.target.value)}
                  className="bg-white text-[#19363c]"
                />
              </div>
            </div>
          ))}
          
          <Button variant="outline" onClick={addVideo} className="w-full" style={{ borderColor: '#333333', color: '#333333' }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Video
          </Button>
        </CardContent>
      </Card>

      {/* Book Description */}
      <Card className="border rounded-lg" style={{ backgroundColor: '#19363c' }}>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-sm md:text-base" style={{ color: '#ffd166' }}>Book Description</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            placeholder="Enter book description..."
            value={bookDesc}
            onChange={(e) => setBookDesc(e.target.value)}
            className="bg-white text-[#19363c]"
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Character Art */}
      <Card className="border rounded-lg" style={{ backgroundColor: '#19363c' }}>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-sm md:text-base" style={{ color: '#ffd166' }}>Character or Book Art</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {characters.map((char, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => removeCharacter(idx)} className="text-white hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Tabs defaultValue={char.url && char.url.includes('/character-images/') ? 'upload' : (char.url ? 'url' : 'upload')} className="w-full">
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
                    className="bg-white text-[#19363c]"
                  />
                </TabsContent>
              </Tabs>
              <Textarea
                placeholder="Description (optional)"
                value={char.description || ""}
                onChange={(e) => updateCharacter(idx, "description", e.target.value)}
                rows={2}
                className="bg-white text-[#19363c]"
              />
            </div>
          ))}
          <Button variant="outline" onClick={addCharacter} className="w-full" style={{ borderColor: '#333333', color: '#333333' }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Art
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border rounded-lg" style={{ backgroundColor: '#19363c' }}>
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm md:text-base" style={{ color: '#ffd166' }}>Book Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {recs.map((rec, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`book-title-${idx}`} className="text-lg font-medium text-white">Book title</Label>
                  <Button variant="ghost" size="sm" onClick={() => removeRecommendation(idx)} className="h-auto p-1 text-white hover:text-white">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id={`book-title-${idx}`}
                  value={rec.recommended_book_title}
                  onChange={(e) => updateRecommendation(idx, "recommended_book_title", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-white text-[#19363c] focus:ring-2 focus:ring-[#ffd166]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`book-author-${idx}`} className="text-lg font-medium text-white">Author name</Label>
                <Input
                  id={`book-author-${idx}`}
                  value={rec.recommended_book_author || ""}
                  onChange={(e) => updateRecommendation(idx, "recommended_book_author", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-white text-[#19363c] focus:ring-2 focus:ring-[#ffd166]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`buy-link-${idx}`} className="text-lg font-medium text-white">Link</Label>
                <Input
                  id={`buy-link-${idx}`}
                  value={rec.buy_link || ""}
                  onChange={(e) => updateRecommendation(idx, "buy_link", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-white text-[#19363c] focus:ring-2 focus:ring-[#ffd166]"
                />
              </div>
              <Button onClick={() => saveRecommendation(idx)} variant="outline" size="sm" className="w-full" style={{ borderColor: '#333333', color: '#19363c', backgroundColor: '#ffd166' }}>
                Save Recommendation
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addRecommendation} className="w-full" style={{ borderColor: '#333333', color: '#333333' }}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Button onClick={saveEnhancements} disabled={isSaving} className="w-full bg-[#ffd166] text-[#333333] mt-4 md:mt-0">
        {isSaving ? "Saving..." : "Save All Bonus Content"}
      </Button>
    </div>
  );
};
