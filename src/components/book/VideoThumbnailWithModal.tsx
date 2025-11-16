import { useState } from "react";
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
  const isYouTube = isYouTubeUrl(videoUrl);
  
  // Auto-generate YouTube thumbnail if not provided
  const displayThumbnail = thumbnailUrl || (isYouTube ? getYouTubeThumbnail(videoUrl) : null);

  return (
    <>
      <div
        className="relative cursor-pointer group rounded-lg overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        {displayThumbnail ? (
          <img
            src={displayThumbnail}
            alt={title || "Video thumbnail"}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <Play className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
          <div className="bg-primary rounded-full p-4">
            <Play className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
      </div>
      
      {(title || description) && (
        <div className="mt-3 space-y-1">
          {title && <h4 className="font-semibold text-foreground">{title}</h4>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

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
              className="w-full aspect-video"
            />
          )}
          {(title || description) && (
            <div className="p-6 space-y-2">
              {title && <h3 className="text-xl font-semibold">{title}</h3>}
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
