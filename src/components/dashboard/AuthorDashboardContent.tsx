
import { Card } from "@/components/ui/card";
import { AuthorQRCodesList } from "@/components/AuthorQRCodesList";
import { TipHistory } from "@/components/TipHistory";

interface AuthorDashboardContentProps {
  authorId: string;
}

export const AuthorDashboardContent = ({ authorId }: AuthorDashboardContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <AuthorQRCodesList authorId={authorId} />
      </div>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Tip Feed</h2>
        <TipHistory authorId={authorId} limit={5} isDashboard={true} />
      </div>
    </div>
  );
};
