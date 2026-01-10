import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { VideoThumbnailWithModal } from "./VideoThumbnailWithModal";

export interface BookVideo {
  url: string;
  type: "thank-you" | "interview" | "other";
  description?: string;
}

interface VideoCarouselProps {
  videos: BookVideo[];
}

const VIDEO_TYPE_LABELS: Record<BookVideo["type"], string> = {
  "thank-you": "Thank You",
  "interview": "Interview",
  "other": "Video",
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
        <Badge variant="secondary" className="mb-2">
          {VIDEO_TYPE_LABELS[video.type]}
        </Badge>
        <VideoThumbnailWithModal
          videoUrl={video.url}
          description={video.description}
        />
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {videos.map((video, index) => (
          <CarouselItem key={index} className="md:basis-1/2">
            <div className="space-y-2">
              <Badge variant="secondary">
                {VIDEO_TYPE_LABELS[video.type]}
              </Badge>
              <VideoThumbnailWithModal
                videoUrl={video.url}
                description={video.description}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
