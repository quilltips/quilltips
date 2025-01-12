import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorProfile } from "@/components/AuthorProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { QrCode, History, Settings, User } from "lucide-react";
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { ProfileSettings } from "@/components/ProfileSettings";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

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
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (!profileData) {
          console.log("No profile found, creating one");
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
        <div className="relative">
          <AuthorProfile
            name={profile.name || "Anonymous Author"}
            bio={profile.bio || "No bio available"}
            imageUrl={profile.avatar_url || "/placeholder.svg"}
          />
          <Tooltip>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6"
              onClick={() => navigate(`/author/${profile.id}`)}
            >
              <User className="h-5 w-5" />
            </Button>
          </Tooltip>
        </div>
        
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
            <AuthorQRCodesList authorId={profile.id} />
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