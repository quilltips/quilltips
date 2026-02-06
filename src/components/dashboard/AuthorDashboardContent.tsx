
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { ActivityCard } from "@/components/dashboard/ActivityCard";

interface AuthorDashboardContentProps {
  authorId: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
}

export const AuthorDashboardContent = ({ 
  authorId, 
  stripeSetupComplete = true,
  hasStripeAccount = true 
}: AuthorDashboardContentProps) => {
  return (
    <div className="space-y-6">
      {/* Combined Activity Card */}
      <ActivityCard authorId={authorId} />
      
      {/* Quilltips Jars - horizontal layout */}
      <div className="border border-[#333333] rounded-xl p-4 bg-transparent">
        <AuthorQRCodesList 
          authorId={authorId}
          stripeSetupComplete={stripeSetupComplete}
          hasStripeAccount={hasStripeAccount}
        />
      </div>
      
      {/* Feed - full width below */}
      <div className="border border-[#333333] rounded-xl p-4 bg-transparent">
        <TipHistory 
          authorId={authorId} 
          limit={5} 
          isDashboard={true} 
          customTitle="Feed"
        />
      </div>
    </div>
  );
};
