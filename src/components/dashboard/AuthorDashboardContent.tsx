
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
      <div className="shadow-md rounded-xl p-4 bg-white">
        <AuthorQRCodesList 
          authorId={authorId}
          stripeSetupComplete={stripeSetupComplete}
          hasStripeAccount={hasStripeAccount}
        />
      </div>
      
      {/* Feed - full width below */}
      <div className=" rounded-xl p-4 bg-white shadow-md">
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
