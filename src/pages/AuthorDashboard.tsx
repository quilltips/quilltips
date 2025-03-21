
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthorDashboardProfile } from "@/components/AuthorDashboardProfile";
import { AuthorStats } from "@/components/dashboard/AuthorStats";
import { AuthorDashboardContent } from "@/components/dashboard/AuthorDashboardContent";
import { useAuthorSession } from "@/hooks/use-author-session";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Define the type for social links
interface SocialLink {
  url: string;
  label: string;
}

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is authenticated as an author
  useAuthorSession();

  // Fetch author profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['author-profile'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'author')
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      return profileData;
    },
    retry: false,
    meta: {
      errorHandler: (error: Error) => {
        console.error("Dashboard error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive"
        });
        navigate("/author/login");
      }
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !profile) return null;

  // Parse social links with type safety
  const socialLinks: SocialLink[] = Array.isArray(profile.social_links) 
    ? profile.social_links.map(link => {
        if (typeof link === 'object' && link !== null && 'url' in link && 'label' in link) {
          return { url: String(link.url), label: String(link.label) };
        }
        return { url: '', label: '' };
      })
    : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#FEF7CD]/30 to-white">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-12">
              <AuthorDashboardProfile 
                name={profile.name || "Anonymous Author"}
                bio={profile.bio || "No bio available"}
                imageUrl={profile.avatar_url || "/placeholder.svg"}
                socialLinks={socialLinks}
              />
              
              <AuthorStats authorId={profile.id} />
            </div>

            <AuthorDashboardContent authorId={profile.id} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorDashboard;
