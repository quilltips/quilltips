import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { TipHistory } from "@/components/TipHistory";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { Loader2 } from "lucide-react";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const AuthorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) throw new Error('Author ID is required');
      if (!UUID_REGEX.test(id)) throw new Error('Invalid author ID format');
      
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', id)
        .eq('role', 'author')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Author not found');
      return data;
    },
    enabled: !!id && UUID_REGEX.test(id),
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-semibold">
            {error?.message || 'Author not found'}
          </h1>
        </div>
      </div>
    );
  }

  // Convert the social_links from JSON to the expected format
  const socialLinks = author.social_links ? 
    (author.social_links as { url: string; label: string }[]) : 
    [];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 space-y-8">
        <AuthorPublicProfileView
          name={author.name || 'Anonymous Author'}
          bio={author.bio || 'No bio available'}
          imageUrl={author.avatar_url || "/placeholder.svg"}
          authorId={author.id}
          socialLinks={socialLinks}
        />
        
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Books</h2>
          <AuthorQRCodes 
            authorId={author.id} 
            authorName={author.name || 'Anonymous Author'} 
          />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <TipHistory 
            authorId={author.id}
            authorName={author.name || 'Anonymous Author'}
            isDashboard={false}
          />
        </div>
      </main>
    </div>
  );
};

export default AuthorPublicProfile;