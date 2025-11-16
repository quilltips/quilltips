import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play } from "lucide-react";

interface VideoThumbnailWithModalProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export const VideoThumbnailWithModal = ({
  videoUrl,
  thumbnailUrl,
  title,
  description,
}: VideoThumbnailWithModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="relative cursor-pointer group rounded-lg overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
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
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full aspect-video"
          />
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
