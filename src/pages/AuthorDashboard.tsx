import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorProfile } from "@/components/AuthorProfile";
import { Button } from "@/components/ui/button";
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
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/author/login");
          return;
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
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

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        {profile && (
          <>
            <AuthorProfile
              name={profile.name}
              bio={profile.bio}
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
          </>
        )}
      </main>
    </div>
  );
};

export default AuthorDashboard;