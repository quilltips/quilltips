
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { TipStatsCard } from "@/components/dashboard/TipStatsCard";
import { ReaderEngagementCard } from "@/components/dashboard/ReaderEngagementCard";

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
      {/* Tips Stats Card */}
      <TipStatsCard authorId={authorId} />
      
      {/* Reader Engagement Banner */}
      <ReaderEngagementCard authorId={authorId} />
      
      {/* Grid layout for Feed and QR codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#333333] rounded-xl p-4 bg-transparent">
          <TipHistory 
            authorId={authorId} 
            limit={5} 
            isDashboard={true} 
            customTitle="Feed"
          />
        </div>
        
        <div className="border border-[#333333] rounded-xl p-4 bg-transparent">
          <AuthorQRCodesList 
            authorId={authorId}
            stripeSetupComplete={stripeSetupComplete}
            hasStripeAccount={hasStripeAccount}
          />
        </div>
      </div>
    </div>
  );
};
