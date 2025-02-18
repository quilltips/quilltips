
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthorDashboardProfile } from "@/components/AuthorDashboardProfile";
import { useToast } from "@/hooks/use-toast";
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { AuthorStats } from "@/components/dashboard/AuthorStats";

// Define the type for social links
interface SocialLink {
  url: string;
  label: string;
}

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) {
          navigate("/author/login");
          return;
        }

        // Verify the user is an author
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || profile?.role !== 'author') {
          navigate("/author/login");
        }
      } catch (error) {
        console.error('Session check error:', error);
        navigate("/author/login");
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/author/login");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
    return <Layout>
      <div className="container mx-auto px-4 pt-24">
        <LoadingSpinner />
      </div>
    </Layout>;
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
                publicProfileLink={`/author/profile/${profile.id}`}
                socialLinks={socialLinks}
              />
              
              <AuthorStats authorId={profile.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <AuthorQRCodesList authorId={profile.id} />
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[#2D3748]">Tip Feed</h2>
                <TipHistory authorId={profile.id} limit={5} isDashboard={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorDashboard;
