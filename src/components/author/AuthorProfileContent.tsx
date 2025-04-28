
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { AuthorPublicTipFeed } from "@/components/tips/AuthorPublicTipFeed";
import { AlertCircle } from "lucide-react";

interface AuthorProfileContentProps {
  authorId: string;
  authorName: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
}

export const AuthorProfileContent = ({
  authorId,
  authorName,
  stripeSetupComplete = false,
  hasStripeAccount = false
}: AuthorProfileContentProps) => {
  // Check if the author has completed Stripe onboarding
  const stripeOnboardingComplete = hasStripeAccount && stripeSetupComplete;

  return <div className="space-y-8">
      {/* Books Section - Only shown if Stripe setup is complete */}
      {stripeOnboardingComplete ? (
        <Card className="border border-[#19363C]/50 shadow-sm rounded-lg overflow-hidden" prominent>
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3748]">Books</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthorQRCodes authorId={authorId} authorName={authorName} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-amber-200 bg-amber-50/50 shadow-sm rounded-lg overflow-hidden p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-sm">
              This author is still setting up their payment account. Check back soon to leave tips!
            </p>
          </div>
        </Card>
      )}
      
      {/* Tip Feed Section - Always shown */}
      <Card className="border border-[#19363C]/50 shadow-sm rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">Tip feed</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorPublicTipFeed authorId={authorId} />
        </CardContent>
      </Card>
      
      {/* Tip Guidance Text - Only shown if Stripe setup is complete */}
      {stripeOnboardingComplete && (
        <p className="text-sm text-[#718096] text-center mt-4">
          To send a tip, simply select a book from the Books section above and click the "Leave a tip!" button!
        </p>
      )}
    </div>;
};
