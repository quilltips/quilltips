
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";

const AuthorSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setProfile(profileData);
      } catch (error: any) {
        console.error("Settings error:", error);
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
      <Layout>
        <div className="text-center pt-24">Loading...</div>
      </Layout>
    );
  }

  if (!profile) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#FEF7CD]/30 to-white">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <h1 className="text-3xl font-semibold text-[#2D3748] mb-8">Account Settings</h1>
          <div className="max-w-2xl mx-auto">
            <ProfileSettings profile={profile} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorSettings;
