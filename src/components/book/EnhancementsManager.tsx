import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Character {
  url: string;
  name: string;
  description?: string;
}

interface Recommendation {
  id?: string;
  recommended_book_title: string;
  recommended_book_author: string;
  recommended_book_cover_url?: string;
  buy_link?: string;
  recommendation_text?: string;
  display_order: number;
}

interface EnhancementsManagerProps {
  qrCodeId: string;
  authorId: string;
  initialData?: {
    thank_you_video_url?: string;
    thank_you_video_thumbnail?: string;
    video_title?: string;
    video_description?: string;
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
  const [videoThumbnail, setVideoThumbnail] = useState(initialData?.thank_you_video_thumbnail || "");
  const [videoTitle, setVideoTitle] = useState(initialData?.video_title || "");
  const [videoDesc, setVideoDesc] = useState(initialData?.video_description || "");
  const [bookDesc, setBookDesc] = useState(initialData?.book_description || "");
  const [characters, setCharacters] = useState<Character[]>(initialData?.character_images || []);
  const [recs, setRecs] = useState<Recommendation[]>(recommendations);
  const [isSaving, setIsSaving] = useState(false);

  const saveEnhancements = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({
          thank_you_video_url: videoUrl || null,
          thank_you_video_thumbnail: videoThumbnail || null,
          video_title: videoTitle || null,
          video_description: videoDesc || null,
          book_description: bookDesc || null,
          character_images: characters as any,
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

  const addRecommendation = () => {
    setRecs([
      ...recs,
      {
        recommended_book_title: "",
        recommended_book_author: "",
        recommended_book_cover_url: "",
        buy_link: "",
        recommendation_text: "",
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
            recommended_book_author: rec.recommended_book_author,
            recommended_book_cover_url: rec.recommended_book_cover_url || null,
            buy_link: rec.buy_link || null,
            recommendation_text: rec.recommendation_text || null,
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
            recommended_book_author: rec.recommended_book_author,
            recommended_book_cover_url: rec.recommended_book_cover_url || null,
            buy_link: rec.buy_link || null,
            recommendation_text: rec.recommendation_text || null,
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
    <div className="space-y-6">
      {/* Video Section */}
      <Card>
        <CardHeader>
          <CardTitle>Thank You Video</CardTitle>
          <CardDescription>Add a personal video message for your readers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Video URL</Label>
            <Input
              placeholder="https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
          <div>
            <Label>Thumbnail URL (optional)</Label>
            <Input
              placeholder="https://..."
              value={videoThumbnail}
              onChange={(e) => setVideoThumbnail(e.target.value)}
            />
          </div>
          <div>
            <Label>Video Title (optional)</Label>
            <Input
              placeholder="Thank you for reading!"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Video Description (optional)</Label>
            <Textarea
              placeholder="A special message..."
              value={videoDesc}
              onChange={(e) => setVideoDesc(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Book Description */}
      <Card>
        <CardHeader>
          <CardTitle>Book Description</CardTitle>
          <CardDescription>Add a detailed description of your book</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter book description..."
            value={bookDesc}
            onChange={(e) => setBookDesc(e.target.value)}
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Character Art */}
      <Card>
        <CardHeader>
          <CardTitle>Character Gallery</CardTitle>
          <CardDescription>Showcase your characters with images and descriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {characters.map((char, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <Label>Character {idx + 1}</Label>
                <Button variant="ghost" size="sm" onClick={() => removeCharacter(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Character name"
                value={char.name}
                onChange={(e) => updateCharacter(idx, "name", e.target.value)}
              />
              <Input
                placeholder="Image URL"
                value={char.url}
                onChange={(e) => updateCharacter(idx, "url", e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={char.description || ""}
                onChange={(e) => updateCharacter(idx, "description", e.target.value)}
                rows={2}
              />
            </div>
          ))}
          <Button variant="outline" onClick={addCharacter} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Character
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Book Recommendations</CardTitle>
          <CardDescription>Recommend books to your readers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recs.map((rec, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <Label>Recommendation {idx + 1}</Label>
                <Button variant="ghost" size="sm" onClick={() => removeRecommendation(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Book title"
                value={rec.recommended_book_title}
                onChange={(e) => updateRecommendation(idx, "recommended_book_title", e.target.value)}
              />
              <Input
                placeholder="Author name"
                value={rec.recommended_book_author}
                onChange={(e) => updateRecommendation(idx, "recommended_book_author", e.target.value)}
              />
              <Input
                placeholder="Cover image URL (optional)"
                value={rec.recommended_book_cover_url || ""}
                onChange={(e) => updateRecommendation(idx, "recommended_book_cover_url", e.target.value)}
              />
              <Input
                placeholder="Buy link (optional)"
                value={rec.buy_link || ""}
                onChange={(e) => updateRecommendation(idx, "buy_link", e.target.value)}
              />
              <Textarea
                placeholder="Your recommendation (optional)"
                value={rec.recommendation_text || ""}
                onChange={(e) => updateRecommendation(idx, "recommendation_text", e.target.value)}
                rows={2}
              />
              <Button onClick={() => saveRecommendation(idx)} variant="outline" size="sm" className="w-full">
                Save Recommendation
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addRecommendation} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Recommendation
          </Button>
        </CardContent>
      </Card>

      <Button onClick={saveEnhancements} disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save All Enhancements"}
      </Button>
    </div>
  );
};
