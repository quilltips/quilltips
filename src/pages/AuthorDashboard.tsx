
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthorDashboardContent } from "@/components/dashboard/AuthorDashboardContent";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { GetStartedBanner } from "@/components/dashboard/GetStartedBanner";

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showGetStarted, setShowGetStarted] = useState(true);
  const { user } = useAuth();
  
  // Fetch author profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['author-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'author')
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      return profileData;
    },
    enabled: !!user, // Only run query if user is logged in
    retry: false,
    meta: {
      errorHandler: (error: Error) => {
        console.error("Dashboard error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive"
        });
        navigate("/author/login");
      }
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !profile) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8F7F2]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-playfair font-medium text-[#2D3748]">Welcome to Quilltips</h1>
              <p className="text-[#4A5568] text-lg">Helping authors get paid</p>
            </div>

            {showGetStarted && (
              <GetStartedBanner 
                onClose={() => setShowGetStarted(false)} 
                hasStripeAccount={!!profile.stripe_account_id}
              />
            )}

            <AuthorDashboardContent authorId={profile.id} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorDashboard;
