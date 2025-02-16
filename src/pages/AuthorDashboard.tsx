
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthorDashboardProfile } from "@/components/AuthorDashboardProfile";
import { useToast } from "@/hooks/use-toast";
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { ProfileSettings } from "@/components/ProfileSettings";
import { Layout } from "@/components/Layout";
import { AuthorQRCodeStats } from "@/components/AuthorQRCodeStats";

const AuthorDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("qrcodes");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          navigate("/author/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profileData) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              name: user.user_metadata.name || user.email,
              bio: user.user_metadata.bio,
              role: user.user_metadata.role || 'reader'
            }])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          setProfile(profileData);
        }
      } catch (error: any) {
        console.error("Dashboard error:", error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load profile",
          variant: "destructive"
        });
        navigate("/author/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center pt-24">Loading...</div>
      </Layout>
    );
  }

  if (!profile) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#FEF7CD]/30 to-white">
        <div className="container mx-auto px-4 pt-24 pb-12 bg-[F8F6F2]">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-12">
              <AuthorDashboardProfile
                name={profile.name || "Anonymous Author"}
                bio={profile.bio || "No bio available"}
                imageUrl={profile.avatar_url || "/placeholder.svg"}
                publicProfileLink={`/author/profile/${profile.id}`}
                socialLinks={profile.social_links || []}
              />
              
              <AuthorQRCodeStats authorId={profile.id} />
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
