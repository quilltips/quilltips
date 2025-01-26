import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthorDashboardProfile } from "@/components/AuthorDashboardProfile";
import { useToast } from "@/hooks/use-toast";
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { ProfileSettings } from "@/components/ProfileSettings";

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
          variant: "destructive",
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
      <div className="text-center pt-24">Loading...</div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <AuthorDashboardProfile
          name={profile.name || "Anonymous Author"}
          bio={profile.bio || "No bio available"}
          imageUrl={profile.avatar_url || "/placeholder.svg"}
          publicProfileLink={`/author/profile/${profile.id}`}
          socialLinks={profile.social_links || []}
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("qrcodes")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "qrcodes" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}
        >
          QR Codes
        </button>
        <button
          onClick={() => setActiveTab("tips")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "tips" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}
        >
          Tip History
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "settings" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}
        >
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === "qrcodes" && (
          <>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Your QR Codes</h2>
              <AuthorQRCodesList authorId={profile.id} />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Recent Tips</h2>
              <TipHistory authorId={profile.id} limit={5} />
            </div>
          </>
        )}
        {activeTab === "tips" && <TipHistory authorId={profile.id} />}
        {activeTab === "settings" && <ProfileSettings profile={profile} />}
      </div>
    </div>
  );
};

export default AuthorDashboard;
