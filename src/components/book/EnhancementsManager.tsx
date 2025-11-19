import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoUpload } from "../upload/VideoUpload";
import { CharacterImageUpload } from "../upload/CharacterImageUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Character {
  url: string;
  description?: string;
}

interface Recommendation {
  id?: string;
  recommended_book_title: string;
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
  };
  recommendations?: Recommendation[];
  onUpdate?: () => void;
}

export const EnhancementsManager = ({
  qrCodeId,
  authorId,
  initialData,
  recommendations = [],
  onUpdate,
}: EnhancementsManagerProps) => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState(initialData?.thank_you_video_url || "");
  const [bookDesc, setBookDesc] = useState(initialData?.book_description || "");
  const [characters, setCharacters] = useState<Character[]>(initialData?.character_images || []);
  const [recs, setRecs] = useState<Recommendation[]>(recommendations);
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine default tab for video: if videoUrl exists and is from storage bucket, show upload tab, otherwise show URL tab
  const defaultVideoTab = videoUrl && videoUrl.includes('/book-videos/') ? 'upload' : (videoUrl ? 'url' : 'upload');

  const saveEnhancements = async () => {
    setIsSaving(true);
    try {
      // Filter out characters without URLs (empty characters)
      const validCharacters = characters.filter(char => char.url && char.url.trim() !== "");
      
      const { error } = await supabase
        .from('qr_codes')
        .update({
          thank_you_video_url: videoUrl || null,
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
    setRecs([
      ...recs,
      {
        recommended_book_title: "",
        buy_link: "",
        display_order: recs.length,
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
            recommended_book_author: "", // Empty string as default since we're simplifying the form
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
          <CardTitle className="text-sm md:text-base" style={{ color: '#ffd166' }}>Thank You Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <Tabs defaultValue={defaultVideoTab} className="w-full">
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
            <TabsContent value="url" className="space-y-4 pt-2">
              <div>
                <Label style={{ color: '#333333' }}>Video URL</Label>
                <Input
                  placeholder="https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="bg-white text-[#19363c]"
                />
              </div>
            </TabsContent>
          </Tabs>
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
            Add Character
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
        {isSaving ? "Saving..." : "Save All Enhancements"}
      </Button>
    </div>
  );
};
