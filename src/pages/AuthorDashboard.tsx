
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthorDashboardContent } from "@/components/dashboard/AuthorDashboardContent";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Banner } from "@/components/dashboard/GetStartedBanner";
import { StripeOnboardingStatus } from "@/components/dashboard/StripeOnboardingStatus";

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [show, setShow] = useState(true);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
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

  // Handle Stripe setup completion
  useState(() => {
    if (searchParams.get('setup') === 'complete' && profile) {
      toast({
        title: "Account Setup Complete",
        description: "Your Stripe account has been connected successfully.",
      });
    }
  });

  // Extract first name for welcome message
  const authorFirstName = profile?.name?.split(' ')[0] || '';
  
  // Check if Stripe account is complete
  const hasStripeAccount = !!profile?.stripe_account_id;
  const stripeSetupComplete = !!profile?.stripe_setup_complete;
  
  // Determine if the Get Started banner should show
  const shouldShowBanner = show && (!hasStripeAccount || !stripeSetupComplete);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-playfair font-medium text-[#2D3748]">
                Welcome to Quilltips{authorFirstName ? `, ${authorFirstName}` : ''}
              </h1>
              <p className="text-[#4A5568] text-lg">Helping authors get paid</p>
            </div>
            
            {hasStripeAccount && stripeSetupComplete && (
              <StripeOnboardingStatus className="text-[#2D3748] mt-2 sm:mt-0" />
            )}
          </div>

          {shouldShowBanner && (
            <Banner 
              onClose={() => setShow(false)} 
              hasStripeAccount={hasStripeAccount}
              stripeSetupComplete={stripeSetupComplete}
              profileId={profile.id}
              stripeAccountId={profile.stripe_account_id}
            />
          )}

          <AuthorDashboardContent authorId={profile.id} />
        </div>
      </div>
    </div>
  );
};

export default AuthorDashboard;
