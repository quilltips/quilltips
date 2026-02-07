import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthorCard } from "@/components/author/AuthorCard";
import { Skeleton } from "@/components/ui/skeleton";

const FEATURED_AUTHOR_IDS = [
  "2964531d-4ba6-4b61-8716-8c63a80f3cae", // Tyler Tarter
  "55056f35-3a44-4d79-8558-69e003be17b0", // Kelly Schweiger
  "51c62b82-f4ed-42d2-83e5-8d73d77482a4", // T.M. Thomas
  "78a82f38-ca14-430d-9ab4-2fc3423edff3", // Author MG
  "3f6b03df-9231-451c-ac2e-491fe9be584c", // Melize Smit
];

interface AuthorProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  slug: string | null;
  created_at: string | null;
}

// Define card positions in a circular arrangement around the text section
// Cards are positioned to form a ring around the left text area without overlapping
const cardPositions = [
  // Top-left area
  { top: "8%", left: "8%", rotation: "rotate-3" },
  // Top-right area (just outside text boundary)
  { top: "12%", left: "52%", rotation: "-rotate-2" },
  // Middle-left area
  { top: "35%", left: "2%", rotation: "rotate-1" },
  // Middle-right area
  { top: "40%", left: "55%", rotation: "-rotate-1" },
  // Bottom area
  { top: "70%", left: "15%", rotation: "rotate-2" },
];

export const FloatingAuthorCards = () => {
  const { data: authors, isLoading } = useQuery({
    queryKey: ["featured-authors-floating"],
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {cardPositions.map((position, i) => (
          <div
            key={i}
            className={`absolute ${position.rotation} transition-all duration-300`}
            style={{ top: position.top, left: position.left }}
          >
            <div className="pointer-events-auto scale-70">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 w-[200px]">
                <div className="flex flex-col items-center space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-16 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!authors || authors.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {authors.slice(0, 5).map((author, index) => {
        const joinedYear = author.created_at 
          ? new Date(author.created_at).getFullYear()
          : new Date().getFullYear();
        
        const position = cardPositions[index] || cardPositions[0];

        return (
          <div
            key={author.id}
            className={`absolute ${position.rotation} transition-all duration-300 hover:scale-105`}
            style={{ top: position.top, left: position.left }}
          >
            <div className="pointer-events-auto scale-70">
              <AuthorCard
                id={author.id}
                name={author.name || "Anonymous Author"}
                avatarUrl={author.avatar_url}
                slug={author.slug}
                joinedYear={joinedYear}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
