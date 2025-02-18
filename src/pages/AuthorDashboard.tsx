
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

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
    onError: (error: Error) => {
      console.error("Dashboard error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive"
      });
      navigate("/author/login");
    }
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/author/login");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/author/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return <Layout>
      <div className="container mx-auto px-4 pt-24">
        <LoadingSpinner />
      </div>
    </Layout>;
  }

  if (error || !profile) return null;

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
                socialLinks={profile.social_links || []}
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
