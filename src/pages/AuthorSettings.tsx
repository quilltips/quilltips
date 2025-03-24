
import { useEffect, useState } from "react";
import { useNavigate, useBeforeUnload } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { UnsavedChangesDialog } from "@/components/profile/UnsavedChangesDialog";
import { usePreventNavigation } from "@/hooks/use-prevent-navigation";

const AuthorSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
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
            <ProfileSettings 
              profile={profile}
              onChangeStatus={setHasUnsavedChanges}
            />
          </div>
        </div>
      </div>

      <UnsavedChangesDialog
        isOpen={showDialog}
        onCancel={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
      />
    </Layout>
  );
};

export default AuthorSettings;
