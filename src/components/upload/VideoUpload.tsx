import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X } from "lucide-react";

interface VideoUploadProps {
  onUploadSuccess: (url: string) => void;
  currentVideoUrl?: string;
  onRemove?: () => void;
}

export const VideoUpload = ({ onUploadSuccess, currentVideoUrl, onRemove }: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validVideoTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, WebM, OGG, or MOV)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 150MB)
    const maxSize = 150 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "For videos over 150MB, please upload to YouTube and paste the link instead. This ensures faster loading for your readers.",
        variant: "destructive",
        duration: 6000,
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book-videos')
        .getPublicUrl(filePath);

      onUploadSuccess(publicUrl);

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          className="relative"
          style={{ borderColor: '#333333', color: '#333333' }}
          onClick={() => document.getElementById('video-upload')?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </>
          )}
        </Button>
        
        {currentVideoUrl && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            style={{ color: '#333333' }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Input
        id="video-upload"
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileUpload}
        className="hidden"
      />

      {currentVideoUrl && (
        <div className="text-xs" style={{ color: '#333333' }}>
          Current video: {currentVideoUrl.split('/').pop()?.substring(0, 30)}...
        </div>
      )}
    </div>
  );
};
