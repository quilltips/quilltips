
import { useState } from "react";
import { TipTable } from "./TipTable";
import { TipDetailsDialog } from "../TipDetailsDialog";
import { useTipHistory } from "@/hooks/use-tip-history";
import { TipHistoryHeader } from "./TipHistoryHeader";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface TipHistoryContainerProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
  isDashboard?: boolean;
  authorName?: string;
  showHeader?: boolean;
  customTitle?: string;
}

export const TipHistoryContainer = ({
  authorId,
  qrCodeId,
  limit,
  isDashboard = true,
  authorName,
  showHeader = true,
  customTitle
}: TipHistoryContainerProps) => {
  const [selectedTip, setSelectedTip] = useState<any | null>(null);
  const [showAll, setShowAll] = useState(!isDashboard);
  
  const { tips, likes, comments, isLoading } = useTipHistory(authorId, qrCodeId, isDashboard ? limit : undefined);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  const title = customTitle || (isDashboard 
    ? qrCodeId 
      ? "QR Code Tips" 
      : "Recent Tips" 
    : `${authorName}'s Activity`);
  
  return (
    <div>
      <TipHistoryHeader
        title={title}
        isDashboard={isDashboard}
        tips={tips}
        likes={likes}
        comments={comments}
        qrCodeId={qrCodeId}
        showHeader={showHeader}
      />

      {tips && tips.length > 0 ? (
        <>
          <TipTable 
            tips={tips} 
            authorId={authorId} 
            likes={likes} 
            comments={comments} 
            showAll={showAll} 
            setShowAll={setShowAll} 
            onSelectTip={setSelectedTip} 
            limit={isDashboard ? limit : 5} 
          />
          
          {isDashboard && tips.length > 0 && (
            <div className="mt-4">
              {/* Blurred overlay for dashboard view */}
              <div className="relative">
                <div className="h-12 bg-gradient-to-b from-transparent to-white/80 absolute bottom-0 left-0 right-0"></div>
              </div>
              
              <div className="flex justify-center mt-4 text-[#333333]">
                <Link to="/author/tip-feed" className="inline-flex items-center text-sm text-[#333333] hover:text-[#2D3748] hover:underline">
                  <Button variant="ghost" className="flex items-center gap-1">
                    See all 
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4 text-[#718096] text-sm">
          No tips yet.
        </div>
      )}

      <TipDetailsDialog 
        isOpen={!!selectedTip} 
        onClose={() => setSelectedTip(null)} 
        tip={selectedTip} 
      />
    </div>
  );
};
