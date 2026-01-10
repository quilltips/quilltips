import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { VideoThumbnailWithModal } from "./VideoThumbnailWithModal";
import { Heart, Mic, Video } from "lucide-react";

export interface BookVideo {
  url: string;
  type: "thank-you" | "interview" | "other";
  description?: string;
}

interface VideoCarouselProps {
  videos: BookVideo[];
}

const VideoTypeIcon = ({ type }: { type: BookVideo["type"] }) => {
  const iconProps = { className: "h-4 w-4 text-muted-foreground" };
  
  switch (type) {
    case "thank-you":
      return <Heart {...iconProps} />;
    case "interview":
      return <Mic {...iconProps} />;
    case "other":
    default:
      return <Video {...iconProps} />;
  }
};

export const VideoCarousel = ({ videos }: VideoCarouselProps) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  // If only one video, show it directly without carousel
  if (videos.length === 1) {
    const video = videos[0];
    return (
      <div className="space-y-2">
        <VideoThumbnailWithModal
          videoUrl={video.url}
          description={video.description}
        />
        <div className="flex justify-end">
          <VideoTypeIcon type={video.type} />
        </div>
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {videos.map((video, index) => (
          <CarouselItem key={index} className="md:basis-1/2">
            <div className="space-y-2">
              <VideoThumbnailWithModal
                videoUrl={video.url}
                description={video.description}
              />
              <div className="flex justify-end">
                <VideoTypeIcon type={video.type} />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
