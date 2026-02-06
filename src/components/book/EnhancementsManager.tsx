import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, HelpCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoUpload } from "../upload/VideoUpload";
import { CharacterImageUpload } from "../upload/CharacterImageUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BookVideo } from "./VideoCarousel";

type BonusSection = "videos" | "letter" | "description" | "characters" | "signups" | "bookshelf" | null;

interface Character {
  url: string;
  description?: string;
}

interface Recommendation {
  id?: string;
  recommended_book_title: string;
  recommended_book_author?: string;
  recommended_book_cover_url?: string;
  recommended_qr_code_id?: string;
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
    letter_to_readers?: string;
    arc_signup_enabled?: boolean;
    beta_reader_enabled?: boolean;
    newsletter_enabled?: boolean;
    book_club_enabled?: boolean;
  };
  recommendations?: Recommendation[];
  onUpdate?: () => void;
}

const VIDEO_TYPE_OPTIONS = [
  { value: "thank-you", label: "Thank-You Video" },
  { value: "interview", label: "Interview" },
  { value: "other", label: "Other" },
] as const;

// Custom hook for debounced auto-save
const useAutoSave = (
  value: string,
  saveFunction: (value: string) => Promise<void>,
  delay: number = 2000
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(value);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't auto-save if value hasn't changed from last saved value
    if (value === lastSavedRef.current) {
      return;
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction(value);
        lastSavedRef.current = value;
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, saveFunction, delay]);

  // Update the lastSavedRef when initial value changes (from server)
  useEffect(() => {
    lastSavedRef.current = value;
  }, []);
};

export const EnhancementsManager = ({
  qrCodeId,
  authorId,
  initialData,
  recommendations = [],
  onUpdate,
}: EnhancementsManagerProps) => {
  const { toast } = useToast();
  
  const getInitialVideos = (): BookVideo[] => {
    if (initialData?.book_videos && Array.isArray(initialData.book_videos) && initialData.book_videos.length > 0) {
      return initialData.book_videos;
    }
    if (initialData?.thank_you_video_url) {
      return [{ url: initialData.thank_you_video_url, type: "thank-you" }];
    }
    return [];
  };
  
  const [videos, setVideos] = useState<BookVideo[]>(getInitialVideos());
  const [bookDesc, setBookDesc] = useState(initialData?.book_description || "");
  const [letterToReaders, setLetterToReaders] = useState(initialData?.letter_to_readers || "");
  const [characters, setCharacters] = useState<Character[]>(initialData?.character_images || []);
  const [recs, setRecs] = useState<Recommendation[]>(recommendations);
  const [isSaving, setIsSaving] = useState(false);
  const [isVideoSaving, setIsVideoSaving] = useState(false);
  const recommendationsRef = useRef<Recommendation[]>(recommendations);
  
  // Signup form toggles
  const [arcSignupEnabled, setArcSignupEnabled] = useState(initialData?.arc_signup_enabled || false);
  const [betaReaderEnabled, setBetaReaderEnabled] = useState(initialData?.beta_reader_enabled || false);
  const [newsletterEnabled, setNewsletterEnabled] = useState(initialData?.newsletter_enabled || false);
  const [bookClubEnabled, setBookClubEnabled] = useState(initialData?.book_club_enabled || false);

  // Bookshelf search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Which bonus section dialog is open (minimal UI: plus opens dialog)
  const [openSection, setOpenSection] = useState<BonusSection>(null);

  // Auto-save function for text fields
  const autoSaveField = useCallback(async (field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ [field]: value || null })
        .eq('id', qrCodeId);

      if (error) throw error;
      console.log(`Auto-saved ${field}`);
    } catch (error) {
      console.error(`Auto-save failed for ${field}:`, error);
    }
  }, [qrCodeId]);

  // Auto-save for book description
  useAutoSave(bookDesc, useCallback((value: string) => autoSaveField('book_description', value), [autoSaveField]));
  
  // Auto-save for letter to readers
  useAutoSave(letterToReaders, useCallback((value: string) => autoSaveField('letter_to_readers', value), [autoSaveField]));

  const saveVideos = async (videosToSave: BookVideo[]) => {
    setIsVideoSaving(true);
    try {
      const validVideos = videosToSave.filter(v => v.url && v.url.trim() !== "");
      
      const { error } = await supabase
        .from('qr_codes')
        .update({ 
          book_videos: validVideos.length > 0 ? validVideos as any : null,
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

  const handleVideoUploadSuccess = (index: number, url: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], url };
    setVideos(updated);
    saveVideos(updated);
  };

  const handleVideoUrlChange = (index: number, url: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], url };
    setVideos(updated);
  };

  const handleVideoTypeChange = (index: number, type: BookVideo["type"]) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], type };
    setVideos(updated);
  };

  const handleVideoDescriptionChange = (index: number, description: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], description };
    setVideos(updated);
  };

  const handleVideoRemove = (index: number) => {
    const updated = videos.filter((_, i) => i !== index);
    setVideos(updated);
    saveVideos(updated);
  };

  const addVideo = () => {
    setVideos([...videos, { url: "", type: "thank-you" }]);
  };

  const saveVideoUrl = async (index: number) => {
    const updated = [...videos];
    if (updated[index]?.url) {
      saveVideos(updated);
    }
  };
  
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
  
  useEffect(() => {
    if (initialData) {
      const newVideos = getInitialVideos();
      setVideos(prevVideos => {
        const savedUrls = new Set(newVideos.map(v => v.url).filter(Boolean));
        const pendingVideos = prevVideos.filter(v => v.url && v.url.trim() !== "" && !savedUrls.has(v.url));
        const unsavedVideos = prevVideos.filter(v => !v.url || v.url.trim() === "");
        
        if (pendingVideos.length > 0 || unsavedVideos.length > 0) {
          return [...newVideos, ...pendingVideos, ...unsavedVideos];
        }
        return newVideos;
      });
      
      setBookDesc(initialData.book_description || "");
      setLetterToReaders(initialData.letter_to_readers || "");
      setArcSignupEnabled(initialData.arc_signup_enabled || false);
      setBetaReaderEnabled(initialData.beta_reader_enabled || false);
      setNewsletterEnabled(initialData.newsletter_enabled || false);
      setBookClubEnabled(initialData.book_club_enabled || false);
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
          letter_to_readers: letterToReaders || null,
          character_images: validCharacters.length > 0 ? validCharacters as any : null,
          arc_signup_enabled: arcSignupEnabled,
          beta_reader_enabled: betaReaderEnabled,
          newsletter_enabled: newsletterEnabled,
          book_club_enabled: bookClubEnabled,
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

  // Bookshelf search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('qr_codes')
          .select('id, book_title, cover_image, slug, author_id, author:public_profiles!author_id(name)')
          .ilike('book_title', `%${searchQuery}%`)
          .neq('author_id', authorId)
          .limit(5);
        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, authorId]);

  const selectBook = async (book: any) => {
    if (recs.some(r => r.recommended_qr_code_id === book.id)) {
      toast({ title: "Already added", description: "This book is already in your bookshelf" });
      return;
    }

    try {
      const authorName = Array.isArray(book.author) ? book.author[0]?.name : book.author?.name;
      const { data, error } = await supabase
        .from('author_book_recommendations')
        .insert({
          author_id: authorId,
          qr_code_id: qrCodeId,
          recommended_qr_code_id: book.id,
          recommended_book_title: book.book_title,
          recommended_book_author: authorName || '',
          recommended_book_cover_url: book.cover_image,
          display_order: recs.length,
        })
        .select()
        .single();

      if (error) throw error;

      setRecs(prev => [...prev, {
        id: data.id,
        recommended_book_title: book.book_title,
        recommended_book_author: authorName || '',
        recommended_book_cover_url: book.cover_image,
        recommended_qr_code_id: book.id,
        display_order: prev.length,
      }]);
      setSearchQuery('');
      setSearchResults([]);
      toast({ title: "Success", description: "Book added to your bookshelf" });
      onUpdate?.();
    } catch (error) {
      console.error('Error adding recommendation:', error);
      toast({ title: "Error", description: "Failed to add book", variant: "destructive" });
    }
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
        toast({ title: "Success", description: "Book removed from bookshelf" });
      } catch (error) {
        console.error("Error removing recommendation:", error);
        toast({ title: "Error", description: "Failed to remove book", variant: "destructive" });
        return;
      }
    }
    setRecs(recs.filter((_, i) => i !== index));
    onUpdate?.();
  };

  // Minimal list: section label + yellow plus. Click opens dialog.
  const sectionRows: { key: BonusSection; label: string; count?: number }[] = [
    { key: "videos", label: "Videos", count: videos.filter(v => v.url?.trim()).length },
    { key: "letter", label: "Letter to Readers" },
    { key: "description", label: "Book Description" },
    { key: "characters", label: "Character or Book Art", count: characters.filter(c => c.url?.trim()).length },
    { key: "signups", label: "Reader Signup Forms" },
    { key: "bookshelf", label: "Bookshelf", count: recs.length },
  ];

  return (
    <div className="space-y-0">
      {sectionRows.map(({ key, label, count }) => (
        <div
          key={key}
          className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
        >
          <span className="text-sm text-[#333333]">
            {label}
            {count !== undefined && count > 0 && (
              <span className="ml-1.5 text-gray-500">({count})</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => setOpenSection(key)}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:ring-offset-1"
            style={{ backgroundColor: "#FFD166", color: "#333333" }}
            aria-label={`Add or edit ${label}`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      ))}

      <Dialog open={openSection !== null} onOpenChange={(open) => !open && setOpenSection(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {openSection === "videos" && "Videos"}
              {openSection === "letter" && "Letter to Readers"}
              {openSection === "description" && "Book Description"}
              {openSection === "characters" && "Character or Book Art"}
              {openSection === "signups" && "Reader Signup Forms"}
              {openSection === "bookshelf" && "Bookshelf"}
            </DialogTitle>
          </DialogHeader>

          {openSection === "videos" && (
            <div className="space-y-3">
              {videos.map((video, idx) => (
                <div key={idx} className="p-3 rounded-lg space-y-3 bg-gray-50 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-[#333333]">Video {idx + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleVideoRemove(idx)} className="h-6 w-6 p-0 hover:bg-transparent text-[#333333]">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <RadioGroup
                    value={video.type}
                    onValueChange={(value) => handleVideoTypeChange(idx, value as BookVideo["type"])}
                    className="flex flex-wrap gap-3"
                  >
                    {VIDEO_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-1.5">
                        <RadioGroupItem value={option.value} id={`video-type-${idx}-${option.value}`} className="h-3 w-3" />
                        <Label htmlFor={`video-type-${idx}-${option.value}`} className="text-xs cursor-pointer text-[#333333]">{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Tabs defaultValue={video.url && video.url.includes('/book-videos/') ? 'upload' : (video.url ? 'url' : 'upload')} className="w-full">
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
                        onUploadSuccess={(url) => handleVideoUploadSuccess(idx, url)}
                        currentVideoUrl={video.url}
                        onRemove={() => { const u = [...videos]; u[idx] = { ...u[idx], url: "" }; setVideos(u); }}
                      />
                      {isVideoSaving && <p className="text-xs mt-1 text-[#19363c]">Saving...</p>}
                    </TabsContent>
                    <TabsContent value="url" className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="https://..." value={video.url} onChange={(e) => handleVideoUrlChange(idx, e.target.value)} className="h-8 text-xs" />
                        <Button type="button" onClick={() => saveVideoUrl(idx)} disabled={isVideoSaving} size="sm" className="h-8 px-3 text-xs bg-[#19363c] text-[#ffd166]">Save</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <Input placeholder="Description (optional)" value={video.description || ""} onChange={(e) => handleVideoDescriptionChange(idx, e.target.value)} className="h-8 text-xs" />
                </div>
              ))}
              <Button variant="outline" onClick={addVideo} className="w-full h-9 text-xs border-dashed border-[#FFD166] text-[#333333] hover:bg-[#FFD166]/10">
                <Plus className="mr-1.5 h-3 w-3" /> Add Video
              </Button>
              <Button onClick={() => saveVideos(videos)} disabled={isVideoSaving} size="sm" className="w-full bg-[#FFD166] text-[#333333] hover:bg-[#FFD166]/90">
                {isVideoSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}

          {openSection === "letter" && (
            <div className="space-y-3">
              <Textarea
                placeholder="Write a personal note to your readers..."
                value={letterToReaders}
                onChange={(e) => setLetterToReaders(e.target.value)}
                className="min-h-[120px] text-sm"
              />
            </div>
          )}

          {openSection === "description" && (
            <div className="space-y-3">
              <Textarea
                placeholder="Enter book description..."
                value={bookDesc}
                onChange={(e) => setBookDesc(e.target.value)}
                className="min-h-[120px] text-sm"
              />
            </div>
          )}

          {openSection === "characters" && (
            <div className="space-y-3">
              {characters.map((char, idx) => (
                <div key={idx} className="p-3 rounded-lg space-y-2 bg-gray-50 border border-gray-200">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeCharacter(idx)} className="h-6 w-6 p-0 hover:bg-transparent text-[#333333]"><X className="h-3 w-3" /></Button>
                  </div>
                  <Tabs defaultValue={char.url && char.url.includes('/character-images/') ? 'upload' : (char.url ? 'url' : 'upload')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-8">
                      <TabsTrigger value="upload" className="text-xs data-[state=active]:bg-[#19363c] data-[state=active]:text-white">Upload</TabsTrigger>
                      <TabsTrigger value="url" className="text-xs data-[state=active]:bg-[#19363c] data-[state=active]:text-white">URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-2">
                      <CharacterImageUpload onUploadSuccess={(url) => updateCharacter(idx, "url", url)} currentImageUrl={char.url} onRemove={() => updateCharacter(idx, "url", "")} />
                    </TabsContent>
                    <TabsContent value="url" className="mt-2">
                      <Input placeholder="Image URL" value={char.url} onChange={(e) => updateCharacter(idx, "url", e.target.value)} className="h-8 text-xs" />
                    </TabsContent>
                  </Tabs>
                  <Textarea placeholder="Description (optional)" value={char.description || ""} onChange={(e) => updateCharacter(idx, "description", e.target.value)} rows={2} className="text-xs" />
                </div>
              ))}
              <Button variant="outline" onClick={addCharacter} className="w-full h-9 text-xs border-dashed border-[#FFD166] text-[#333333] hover:bg-[#FFD166]/10">
                <Plus className="mr-1.5 h-3 w-3" /> Add Art
              </Button>
              <Button onClick={saveEnhancements} disabled={isSaving} size="sm" className="w-full bg-[#FFD166] text-[#333333] hover:bg-[#FFD166]/90">
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}

          {openSection === "signups" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">Enable signup forms on this book page. Signups appear in your author dashboard.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="arc-signup" className="text-sm cursor-pointer text-[#333333]">ARC Reader Signup</Label>
                  <Switch id="arc-signup" checked={arcSignupEnabled} onCheckedChange={setArcSignupEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="beta-signup" className="text-sm cursor-pointer text-[#333333]">Beta Reader Signup</Label>
                  <Switch id="beta-signup" checked={betaReaderEnabled} onCheckedChange={setBetaReaderEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter-signup" className="text-sm cursor-pointer text-[#333333]">Newsletter Signup</Label>
                  <Switch id="newsletter-signup" checked={newsletterEnabled} onCheckedChange={setNewsletterEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="book-club-signup" className="text-sm cursor-pointer text-[#333333]">Book Club Invitations</Label>
                  <Switch id="book-club-signup" checked={bookClubEnabled} onCheckedChange={setBookClubEnabled} />
                </div>
              </div>
              <Button onClick={saveEnhancements} disabled={isSaving} size="sm" className="w-full bg-[#FFD166] text-[#333333] hover:bg-[#FFD166]/90">
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}

          {openSection === "bookshelf" && (
            <div className="space-y-3">
              {recs.map((rec, idx) => (
                <div key={rec.id || idx} className="p-3 rounded-lg flex items-center gap-3 bg-gray-50 border border-gray-200">
                  {rec.recommended_book_cover_url ? (
                    <img src={rec.recommended_book_cover_url} alt={rec.recommended_book_title} className="w-10 h-14 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0 text-[8px]">No cover</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-[#333333]">{rec.recommended_book_title}</p>
                    {rec.recommended_book_author && <p className="text-[10px] truncate text-gray-600">{rec.recommended_book_author}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeRecommendation(idx)} className="h-6 w-6 p-0 flex-shrink-0 text-[#333333]"><X className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for books on Quilltips..." className="h-9 pl-8 text-sm" />
              </div>
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto">
                  {searchResults.map((book) => {
                    const bookAuthorName = Array.isArray(book.author) ? book.author[0]?.name : book.author?.name;
                    return (
                      <button key={book.id} type="button" onClick={() => selectBook(book)} className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 text-left">
                        {book.cover_image ? <img src={book.cover_image} alt={book.book_title} className="w-8 h-12 object-cover rounded flex-shrink-0" /> : <div className="w-8 h-12 bg-muted rounded flex items-center justify-center text-[6px]">No cover</div>}
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate text-[#333333]">{book.book_title}</p>
                          {bookAuthorName && <p className="text-[10px] truncate text-gray-600">by {bookAuthorName}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {isSearching && <p className="text-xs text-center text-gray-500">Searching...</p>}
              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && <p className="text-xs text-center text-gray-500">No books found</p>}
            </div>
          )}

          {(openSection === "letter" || openSection === "description") && (
            <Button onClick={saveEnhancements} disabled={isSaving} size="sm" className="w-full bg-[#FFD166] text-[#333333] hover:bg-[#FFD166]/90">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
