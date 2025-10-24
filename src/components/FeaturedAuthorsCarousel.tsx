import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { AuthorCard } from "@/components/author/AuthorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const FEATURED_AUTHOR_IDS = [
  "2964531d-4ba6-4b61-8716-8c63a80f3cae", // Tyler Tarter
  "55056f35-3a44-4d79-8558-69e003be17b0", // Kelly Schweiger
  "51c62b82-f4ed-42d2-83e5-8d73d77482a4", // T.M. Thomas
  "e14f7979-c1ca-4a91-9eb7-df4098759bac", // Frank Eugene Dukes Jr
  "3f6b03df-9231-451c-ac2e-491fe9be584c", // Melize Smit
  "485c1a1f-5bf0-4c0d-b51c-c97af069fabd", // Gabriel Nardi-Huffman
  "757201a7-8ca4-4801-8bdb-ad62c168146a", // Kitty Laroux

];

interface AuthorProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  slug: string | null;
  created_at: string | null;
}

export const FeaturedAuthorsCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const { data: authors, isLoading } = useQuery({
    queryKey: ["featured-authors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("id, name, avatar_url, slug, created_at")
        .in("id", FEATURED_AUTHOR_IDS);

      if (error) throw error;
      
      // Sort by the order in FEATURED_AUTHOR_IDS
      return (data as AuthorProfile[]).sort((a, b) => 
        FEATURED_AUTHOR_IDS.indexOf(a.id) - FEATURED_AUTHOR_IDS.indexOf(b.id)
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Track current slide for potential future use
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl mt-16 px-4" aria-label="Featured authors">
        <h2 className="text-2xl sm:text-3xl font-playfair font-semibold text-center text-foreground mb-8">
          Trusted by authors of all genres
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(FEATURED_AUTHOR_IDS.length)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!authors || authors.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl mt-12 px-4" aria-label="Featured authors">
    

      {/* Auto-scrolling Carousel for all screen sizes */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {authors.map((author) => {
            const joinedYear = author.created_at 
              ? new Date(author.created_at).getFullYear()
              : new Date().getFullYear();

            return (
              <CarouselItem key={author.id} className="pl-2 md:pl-4 basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-0.5rem)] lg:basis-[calc(20%-0.5rem)]">
                <AuthorCard
                  id={author.id}
                  name={author.name || "Anonymous Author"}
                  avatarUrl={author.avatar_url}
                  slug={author.slug}
                  joinedYear={joinedYear}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        <div className="flex justify-center mt-6">
          <CarouselPrevious className="relative left-0 translate-x-0 translate-y-0" />
          <CarouselNext className="relative right-0 translate-x-0 translate-y-0 ml-2" />
        </div>
      </Carousel>
    </section>
  );
};
