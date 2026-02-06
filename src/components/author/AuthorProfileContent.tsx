
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { AuthorPublicTipFeed } from "@/components/tips/AuthorPublicTipFeed";
import { CollapsibleSignupSection } from "@/components/author/CollapsibleSignupSection";
import { getOtherLinks, getSocialIconLinks, getValidURL, SocialIconLinkRow, type SocialLink } from "@/components/AuthorPublicProfile";
import { Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthorProfileContentProps {
  authorId: string;
  authorName: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
  socialLinks?: SocialLink[];
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
  hasStripeAccount = false,
  socialLinks = []
}: AuthorProfileContentProps) => {
  const socialIconLinks = getSocialIconLinks(socialLinks);
  const otherLinks = getOtherLinks(socialLinks);
  const hasAnyLinks = socialIconLinks.length > 0 || otherLinks.length > 0;
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

      {/* Links section: social icons on their own line, then other links */}
      {hasAnyLinks && (
        <Card className="border border-[#19363C]/50 shadow-sm rounded-xl overflow-hidden bg-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-[#333333]">Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {socialIconLinks.length > 0 && (
              <SocialIconLinkRow links={socialIconLinks} />
            )}
            {otherLinks.length > 0 && (
              <div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-2">
                {otherLinks.map((link, index) => (
                  <a
                    key={index}
                    href={getValidURL(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#333333] font-bold hover:underline transition-colors"
                  >
                    <LinkIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">
                      {link.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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


  
      {/* Feed Section */}
      <Card className="border border-[#19363C]/50 shadow-sm rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">Fanmail</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorPublicTipFeed authorId={authorId} />
        </CardContent>
      </Card>
  
    </div>
  );
}