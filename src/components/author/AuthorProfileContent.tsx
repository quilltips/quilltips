
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
      {stripeOnboardingComplete ? (
        <Card className="border border-[#333333]/50 rounded-lg overflow-hidden" prominent>
          <CardHeader>
            <CardTitle className="text-xl text-[#333333]">Books</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <AuthorQRCodes authorId={authorId} authorName={authorName} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-[#FFD166]/30 bg-amber-50/30 rounded-lg overflow-hidden p-6">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-[#FFD166] flex-shrink-0" />
            <div>
              <p className="text-[#19363C] font-medium">
                This author hasn't added any books yet
              </p>
              <p className="text-sm text-[#19363C]/70 mt-1">
                Check back later for updates!
              </p>
            </div>
          </div>
        </Card>
      )}
  
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
      {stripeOnboardingComplete && (
        <p className="text-sm text-[#718096] text-center mt-4">
          To send a tip, simply select a book from the Books section above and click the "Leave a tip!" button!
        </p>
      )}
    </div>
  );
}  