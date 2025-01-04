import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Navigation } from "@/components/Navigation";
import { AuthorProfile } from "@/components/AuthorProfile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";

const AuthorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/author/login");
          return;
        }

        setProfile({
          name: user.user_metadata.name,
          bio: user.user_metadata.bio,
          imageUrl: user.user_metadata.avatar_url || "/placeholder.svg",
          stripeConnected: user.user_metadata.stripe_connected || false
        });
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
  }, [supabase, navigate, toast]);

  const handleConnectStripe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/author/login");
        return;
      }

      // This would typically call your backend to create a Stripe Connect account
      // and return an account link URL
      toast({
        title: "Coming Soon",
        description: "Stripe Connect integration will be available soon!",
      });
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast({
        title: "Error",
        description: "Failed to connect Stripe account",
        variant: "destructive",
      });
    }
  };

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
              imageUrl={profile.imageUrl}
            />
            
            {!profile.stripeConnected && (
              <div className="flex justify-center">
                <Button
                  onClick={handleConnectStripe}
                  className="hover-lift"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Stripe Account
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AuthorDashboard;