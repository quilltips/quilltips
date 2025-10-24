import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AuthorCard } from "@/components/author/AuthorCard";
import { Skeleton } from "@/components/ui/skeleton";

const FEATURED_AUTHOR_IDS = [
  "2964531d-4ba6-4b61-8716-8c63a80f3cae", // Tyler Tarter
  "bc469a0f-01b0-43b4-bc02-08e39d6a90bb", // Beth Holly
  "d374263f-b9bf-449d-bbec-fca7059c4c1e", // Cash Fioretti
  "e14f7979-c1ca-4a91-9eb7-df4098759bac", // Frank Eugene Dukes Jr
  "3f6b03df-9231-451c-ac2e-491fe9be584c", // Melize Smit
];

interface AuthorProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  slug: string | null;
  created_at: string | null;
}

export const FeaturedAuthorsCarousel = () => {
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

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl mt-16 px-4" aria-label="Featured authors">
        <h2 className="text-2xl sm:text-3xl font-playfair font-semibold text-center text-foreground mb-8">
          Trusted by authors worldwide
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(5)].map((_, i) => (
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
    <section className="mx-auto w-full max-w-6xl mt-16 px-4" aria-label="Featured authors">
      <h2 className="text-2xl sm:text-3xl font-playfair font-semibold text-center text-foreground mb-8">
        Trusted by authors worldwide
      </h2>

      {/* Mobile: Show carousel */}
      <div className="block md:hidden">
        <Carousel
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
                <CarouselItem key={author.id} className="pl-2 md:pl-4 basis-1/2">
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
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {authors.map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 rounded-full bg-muted"
                aria-hidden="true"
              />
            ))}
          </div>
        </Carousel>
      </div>

      {/* Tablet/Desktop: Show grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {authors.map((author) => {
          const joinedYear = author.created_at 
            ? new Date(author.created_at).getFullYear()
            : new Date().getFullYear();

          return (
            <AuthorCard
              key={author.id}
              id={author.id}
              name={author.name || "Anonymous Author"}
              avatarUrl={author.avatar_url}
              slug={author.slug}
              joinedYear={joinedYear}
            />
          );
        })}
      </div>
    </section>
  );
};
