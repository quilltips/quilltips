
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { AuthorPublicTipFeed } from "@/components/tips/AuthorPublicTipFeed";
import { CollapsibleSignupSection } from "@/components/author/CollapsibleSignupSection";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthorProfileContentProps {
  authorId: string;
  authorName: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
}

interface LandingPageSettings {
  arc_signup_enabled: boolean;
  arc_signup_description: string | null;
  beta_reader_enabled: boolean;
  beta_reader_description: string | null;
  newsletter_enabled: boolean;
  newsletter_description: string | null;
}

export const AuthorProfileContent = ({
  authorId,
  authorName,
  stripeSetupComplete = false,
  hasStripeAccount = false
}: AuthorProfileContentProps) => {
  const [landingPageSettings, setLandingPageSettings] = useState<LandingPageSettings | null>(null);
  
  // Check if the author has completed Stripe onboarding
  const stripeOnboardingComplete = hasStripeAccount && stripeSetupComplete;

  useEffect(() => {
    const fetchLandingPageSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select(`
            arc_signup_enabled,
            arc_signup_description,
            beta_reader_enabled,
            beta_reader_description,
            newsletter_enabled,
            newsletter_description
          `)
          .eq('id', authorId)
          .single();

        if (error) throw error;
        
        setLandingPageSettings({
          arc_signup_enabled: data.arc_signup_enabled || false,
          arc_signup_description: data.arc_signup_description || null,
          beta_reader_enabled: data.beta_reader_enabled || false,
          beta_reader_description: data.beta_reader_description || null,
          newsletter_enabled: data.newsletter_enabled || false,
          newsletter_description: data.newsletter_description || null,
        });
      } catch (error) {
        console.error('Error fetching landing page settings:', error);
      }
    };

    fetchLandingPageSettings();
  }, [authorId]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 py-8">
      {/* Books Section */}
      <Card className="border border-[#333333]/50 rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#333333]">Books</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <AuthorQRCodes 
            authorId={authorId} 
            authorName={authorName}
            stripeSetupComplete={stripeSetupComplete}
            hasStripeAccount={hasStripeAccount}
          />
        </CardContent>
      </Card>

      {/* Reader Engagement Section - Collapsible Signups */}
      <CollapsibleSignupSection
        authorId={authorId}
        arcEnabled={landingPageSettings?.arc_signup_enabled || false}
        arcDescription={landingPageSettings?.arc_signup_description}
        betaEnabled={landingPageSettings?.beta_reader_enabled || false}
        betaDescription={landingPageSettings?.beta_reader_description}
        newsletterEnabled={landingPageSettings?.newsletter_enabled || false}
        newsletterDescription={landingPageSettings?.newsletter_description}
      />
  
      {/* Tip Feed Section */}
      <Card className="border border-[#19363C]/50 shadow-sm rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">Tip feed</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorPublicTipFeed authorId={authorId} />
        </CardContent>
      </Card>
  
      {/* Tip Guidance Text */}
      <p className="text-sm text-[#718096] text-center mt-4">
        {stripeOnboardingComplete 
          ? "To send a tip, simply select a book from the Books section above and click the \"Leave a tip!\" button!"
          : "Books are shown below. Tipping will be available once the author completes their payment setup."
        }
      </p>
    </div>
  );
}