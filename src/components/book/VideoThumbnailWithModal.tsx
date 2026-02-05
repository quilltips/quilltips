import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play } from "lucide-react";

interface VideoThumbnailWithModalProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
};

const getYouTubeThumbnail = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

export const VideoThumbnailWithModal = ({
  videoUrl,
  thumbnailUrl,
  title,
  description,
}: VideoThumbnailWithModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isYouTube = isYouTubeUrl(videoUrl);
  
  // Generate thumbnail from uploaded video (non-YouTube)
  useEffect(() => {
    if (!videoUrl || isYouTube || thumbnailUrl) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const generateThumbnail = () => {
      try {
        video.currentTime = 1; // Try to get frame at 1 second
      } catch (error) {
        console.error("Error setting video time:", error);
      }
    };

    const captureFrame = () => {
      if (canvas && video && video.readyState >= 2) {
        try {
          const ctx = canvas.getContext('2d');
          if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setGeneratedThumbnail(thumbnailDataUrl);
          }
        } catch (error) {
          console.error("Error capturing video frame:", error);
        }
      }
    };

    video.addEventListener('loadedmetadata', generateThumbnail);
    video.addEventListener('seeked', captureFrame);
    video.addEventListener('loadeddata', () => {
      if (video.readyState >= 2) {
        generateThumbnail();
      }
    });

    return () => {
      video.removeEventListener('loadedmetadata', generateThumbnail);
      video.removeEventListener('seeked', captureFrame);
      video.removeEventListener('loadeddata', generateThumbnail);
    };
  }, [videoUrl, isYouTube, thumbnailUrl]);
  
  // Auto-generate YouTube thumbnail if not provided, or use generated thumbnail for uploaded videos
  const displayThumbnail = thumbnailUrl || (isYouTube ? getYouTubeThumbnail(videoUrl) : generatedThumbnail);

  return (
    <>
      {/* Hidden video and canvas for thumbnail generation */}
      {!isYouTube && !thumbnailUrl && (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            preload="metadata"
            crossOrigin="anonymous"
          />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
      
      <div className="max-w-xl mx-auto">
        <div
          className="relative cursor-pointer group rounded-lg overflow-hidden aspect-video w-full"
          onClick={() => setIsOpen(true)}
        >
          {displayThumbnail ? (
            <img
              src={displayThumbnail}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Play className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
            <div className="bg-primary rounded-full p-4">
              <Play className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
          {isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full max-h-[80vh] object-contain"
              style={{ maxWidth: '100%' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
