import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorProfile } from "@/components/AuthorProfile";
import { TipHistory } from "@/components/TipHistory";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { Loader2 } from "lucide-react";

const AuthorPublicProfile = () => {
  const { id } = useParams();

  const { data: author, isLoading } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) throw new Error('Author ID is required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', id)
        .eq('role', 'author')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
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

  if (!author) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-semibold">Author not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 space-y-8">
        <AuthorProfile
          name={author.name || 'Anonymous Author'}
          bio={author.bio || 'No bio available'}
          imageUrl="/placeholder.svg"
          authorId={author.id}
        />
        
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Books</h2>
          <AuthorQRCodes 
            authorId={author.id} 
            authorName={author.name || 'Anonymous Author'} 
          />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Recent Tips</h2>
          <TipHistory authorId={author.id} />
        </div>
      </main>
    </div>
  );
};

export default AuthorPublicProfile;