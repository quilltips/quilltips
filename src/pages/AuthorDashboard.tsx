import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorProfile } from "@/components/AuthorProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { QrCode, History, Settings } from "lucide-react";
import { CreateQRCode } from "@/components/CreateQRCode";
import { TipHistory } from "@/components/TipHistory";
import { ProfileSettings } from "@/components/ProfileSettings";

const AuthorDashboard = () => {
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
          console.log("No authenticated user found");
          navigate("/author/login");
          return;
        }

        console.log("Fetching profile for user:", user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (!profileData) {
          console.error("No profile data found");
          throw new Error("Profile not found");
        }

        console.log("Profile data fetched:", profileData);
        setProfile(profileData);
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
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <AuthorProfile
          name={profile.name || "Anonymous Author"}
          bio={profile.bio || "No bio available"}
          imageUrl={profile.avatar_url || "/placeholder.svg"}
        />
        
        <Tabs defaultValue="qrcodes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qrcodes" className="space-x-2">
              <QrCode className="h-4 w-4" />
              <span>QR Codes</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="space-x-2">
              <History className="h-4 w-4" />
              <span>Tip History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="qrcodes">
            <CreateQRCode authorId={profile.id} />
          </TabsContent>
          
          <TabsContent value="tips">
            <TipHistory authorId={profile.id} />
          </TabsContent>
          
          <TabsContent value="settings">
            <ProfileSettings profile={profile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AuthorDashboard;