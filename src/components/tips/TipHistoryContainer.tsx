
import { useState } from "react";
import { TipTable } from "./TipTable";
import { TipDetailsDialog } from "../TipDetailsDialog";
import { useTipHistory } from "@/hooks/use-tip-history";
import { TipHistoryHeader } from "./TipHistoryHeader";
import { LoadingSpinner } from "../ui/loading-spinner";

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
      <div className="flex justify-center items-center py-8">
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
        <TipTable 
          tips={tips} 
          authorId={authorId} 
          likes={likes} 
          comments={comments} 
          showAll={showAll} 
          setShowAll={setShowAll} 
          onSelectTip={setSelectedTip} 
          limit={limit} 
        />
      ) : (
        <div className="text-center py-8 text-[#718096]">
          No tips yet. Share your QR codes to start receiving tips!
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
