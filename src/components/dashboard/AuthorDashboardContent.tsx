
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";

interface AuthorDashboardContentProps {
  authorId: string;
}

export const AuthorDashboardContent = ({ authorId }: AuthorDashboardContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-black rounded-xl p-4 bg-white">
        <TipHistory 
          authorId={authorId} 
          limit={5} 
          isDashboard={true} 
          customTitle="Tip feed"
        />
      </div>
      
      <div className="border border-black rounded-xl p-4 bg-white">
        <AuthorQRCodesList authorId={authorId} />
      </div>
    </div>
  );
};
