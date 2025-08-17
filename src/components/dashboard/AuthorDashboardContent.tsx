
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TipStatsCard authorId={authorId} />
        <ReaderEngagementCard authorId={authorId} />
      </div>
      
      {/* Grid layout for Tip feed and QR codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#333333] rounded-xl p-4 bg-transparent">
          <TipHistory 
            authorId={authorId} 
            limit={5} 
            isDashboard={true} 
            customTitle="Tip feed"
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
