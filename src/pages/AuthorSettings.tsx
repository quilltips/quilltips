
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnsavedChangesDialog } from "@/components/profile/UnsavedChangesDialog";
import { usePreventNavigation } from "@/hooks/use-prevent-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { AccountTab } from "@/components/settings/AccountTab";
import { PaymentTab } from "@/components/settings/PaymentTab";
import { LandingPageTab } from "@/components/settings/LandingPageTab";
import { Settings } from "lucide-react";

const AuthorSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use the hook to prevent window/tab closing with unsaved changes
  usePreventNavigation(hasUnsavedChanges);

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

  // Set up navigation interceptor
  useEffect(() => {
    // Create custom event listener for navigation events
    const handleNavigation = (event: MouseEvent) => {
      // Only intercept navigation if there are unsaved changes
      if (!hasUnsavedChanges) return;
      
      const target = event.target as HTMLElement;
      const closestLink = target.closest("a");
      
      if (closestLink && closestLink.getAttribute("href")) {
        // Get the destination
        const href = closestLink.getAttribute("href");
        
        // Only intercept internal navigation (not external links)
        if (href && !href.startsWith("http") && !href.startsWith("mailto:")) {
          event.preventDefault();
          setPendingNavigation(href);
          setShowDialog(true);
        }
      }
    };

    document.addEventListener("click", handleNavigation);
    
    return () => {
      document.removeEventListener("click", handleNavigation);
    };
  }, [hasUnsavedChanges]);

  const handleConfirmNavigation = () => {
    setShowDialog(false);
    if (pendingNavigation) {
      // Navigate to the pending destination
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowDialog(false);
    setPendingNavigation(null);
  };

  if (isLoading) {
    return (
      <div className="text-center pt-24">Loading...</div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-playfair text-center mb-12 flex items-center justify-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
        <div className="max-w-2xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="profile"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#333333] data-[state=active]:text-[#333333] data-[state=active]:font-medium bg-transparent"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="landing-page"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#333333] data-[state=active]:text-[#333333] data-[state=active]:font-medium bg-transparent"
              >
                Landing Page
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#333333] data-[state=active]:text-[#333333] data-[state=active]:font-medium bg-transparent"
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#333333] data-[state=active]:text-[#333333] data-[state=active]:font-medium bg-transparent"
              >
                Payments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <ProfileTab 
                profile={profile}
                onChangeStatus={setHasUnsavedChanges}
              />
            </TabsContent>
            
            <TabsContent value="landing-page" className="mt-6">
              <LandingPageTab 
                profileId={profile.id}
                onChangeStatus={setHasUnsavedChanges}
              />
            </TabsContent>
            
            <TabsContent value="account" className="mt-6">
              <AccountTab />
            </TabsContent>
            
            <TabsContent value="payments" className="mt-6">
              <PaymentTab profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <UnsavedChangesDialog
        isOpen={showDialog}
        onCancel={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
      />
    </div>
  );
};

export default AuthorSettings;
