import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Trash2, Play } from "lucide-react";

interface VideoUploadProps {
  onUploadSuccess: (url: string) => void;
  currentVideoUrl?: string;
  onRemove?: () => void;
}

// Helper to check if URL is a YouTube URL
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Get YouTube thumbnail from URL
const getYouTubeThumbnail = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
  }
  return null;
};

export const VideoUpload = ({ onUploadSuccess, currentVideoUrl, onRemove }: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate thumbnail for uploaded videos
  useEffect(() => {
    if (currentVideoUrl && !isYouTubeUrl(currentVideoUrl)) {
      // Create video element to generate thumbnail
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'metadata';
      
      video.onloadeddata = () => {
        video.currentTime = 1; // Seek to 1 second for thumbnail
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setGeneratedThumbnail(canvas.toDataURL('image/jpeg'));
        }
      };
      
      video.onerror = () => {
        setGeneratedThumbnail(null);
      };
      
      video.src = currentVideoUrl;
    } else if (currentVideoUrl && isYouTubeUrl(currentVideoUrl)) {
      setGeneratedThumbnail(getYouTubeThumbnail(currentVideoUrl));
    } else {
      setGeneratedThumbnail(null);
    }
  }, [currentVideoUrl]);

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

  // Get display thumbnail (generated or YouTube)
  const displayThumbnail = currentVideoUrl 
    ? (isYouTubeUrl(currentVideoUrl) ? getYouTubeThumbnail(currentVideoUrl) : generatedThumbnail)
    : null;

  return (
    <div className="space-y-3">
      {/* Video Preview with Delete */}
      {currentVideoUrl && (
        <div className="relative group">
          <div className="relative aspect-video w-full max-w-[280px] rounded-lg overflow-hidden border" style={{ backgroundColor: '#333333' }}>
            {displayThumbnail ? (
              <img 
                src={displayThumbnail} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-12 w-12" style={{ color: '#ffd166' }} />
              </div>
            )}
            
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(25, 54, 60, 0.8)' }}>
                <Play className="h-6 w-6 ml-1" style={{ color: '#ffd166' }} />
              </div>
            </div>

            {/* Delete button overlay */}
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Video filename */}
          <p className="text-xs mt-1 truncate max-w-[280px]" style={{ color: '#333333' }}>
            {currentVideoUrl.includes('youtube') || currentVideoUrl.includes('youtu.be') 
              ? 'YouTube video linked'
              : currentVideoUrl.split('/').pop()?.substring(0, 40) + (currentVideoUrl.split('/').pop()!.length > 40 ? '...' : '')
            }
          </p>
        </div>
      )}

      {/* Upload Button */}
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
              {currentVideoUrl ? 'Replace Video' : 'Upload Video'}
            </>
          )}
        </Button>
      </div>

      <Input
        id="video-upload"
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden elements for thumbnail generation */}
      <video ref={videoRef} className="hidden" muted preload="metadata" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
