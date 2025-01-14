import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorDashboardProfile } from "@/components/AuthorDashboardProfile";
import { useToast } from "@/hooks/use-toast";
import { QrCode, History, Settings, ChevronRight } from "lucide-react";
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { ProfileSettings } from "@/components/ProfileSettings";
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail
} from "@/components/ui/sidebar";

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
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const sidebarItems = [
    { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
    { id: 'tips', label: 'Tip History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <Navigation />
        
        <Sidebar 
          className="mt-16 pt-4" 
          variant="floating"
          collapsible="icon"
        >
          <SidebarHeader className="px-2 flex items-center justify-between">
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail>
            <ChevronRight className="h-4 w-4" />
          </SidebarRail>
        </Sidebar>

        <SidebarInset className="pt-16">
          <div className="container p-6">
            <div className="mb-8">
              <AuthorDashboardProfile
                name={profile.name || "Anonymous Author"}
                bio={profile.bio || "No bio available"}
                imageUrl={profile.avatar_url || "/placeholder.svg"}
                authorId={profile.id}
                publicProfileLink={`/author/profile/${profile.id}`}
              />
            </div>

            <div className="space-y-8">
              {activeTab === "qrcodes" && <AuthorQRCodesList authorId={profile.id} />}
              {activeTab === "tips" && <TipHistory authorId={profile.id} />}
              {activeTab === "settings" && <ProfileSettings profile={profile} />}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AuthorDashboard;