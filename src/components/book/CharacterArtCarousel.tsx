import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ImageModal } from "@/components/ui/image-modal";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Character {
  url: string;
  name?: string;
  description?: string;
}

interface CharacterArtCarouselProps {
  characters: Character[];
}

export const CharacterArtCarousel = ({ characters }: CharacterArtCarouselProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!characters || characters.length === 0) {
    return null;
  }

  return (
    <>
      <Carousel className="w-full px-10">
        <CarouselContent>
          {characters.map((character, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div
                className="space-y-2 cursor-pointer"
                onClick={() => setSelectedImage(character.url)}
              >
                <OptimizedImage
                  src={character.url}
                  alt={character.name || "Character art"}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="space-y-1">
                  {character.name && (
                    <h4 className="font-semibold text-foreground">{character.name}</h4>
                  )}
                  {character.description && (
                    <p className="text-sm">{character.description}</p>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {characters.length > 1 && (
          <>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </>
        )}
      </Carousel>

      <ImageModal
        src={selectedImage || ""}
        alt="Character art"
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};
