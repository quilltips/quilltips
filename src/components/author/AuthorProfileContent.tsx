
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { AuthorPublicTipFeed } from "@/components/tips/AuthorPublicTipFeed";
import { BookOpen } from "lucide-react";

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