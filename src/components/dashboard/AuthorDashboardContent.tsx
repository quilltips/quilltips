
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";
import { TipStatsCard } from "@/components/dashboard/TipStatsCard";

interface AuthorDashboardContentProps {
  authorId: string;
}

export const AuthorDashboardContent = ({ authorId }: AuthorDashboardContentProps) => {
  return (
    <div className="space-y-6">
      {/* Tip Stats Card */}
      <div>
        <TipStatsCard authorId={authorId} />
      </div>
      
      {/* Grid layout for Tip feed and QR codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#19363C]/50 rounded-xl p-4 bg-white">
          <TipHistory 
            authorId={authorId} 
            limit={5} 
            isDashboard={true} 
            customTitle="Tip feed"
          />
        </div>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
          <AuthorQRCodesList authorId={authorId} />
        </div>
      </div>
    </div>
  );
};
