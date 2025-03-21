
import { useState } from "react";
import { TipTable } from "./TipTable";
import { TipDetailsDialog } from "../TipDetailsDialog";
import { Card } from "../ui/card";
import { useTipHistory } from "@/hooks/use-tip-history";
import { TipHistoryHeader } from "./TipHistoryHeader";

interface TipHistoryContainerProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
  isDashboard?: boolean;
  authorName?: string;
  showHeader?: boolean;
}

export const TipHistoryContainer = ({
  authorId,
  qrCodeId,
  limit,
  isDashboard,
  authorName,
  showHeader = true
}: TipHistoryContainerProps) => {
  const [selectedTip, setSelectedTip] = useState<any | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const { tips, likes, comments, isLoading } = useTipHistory(authorId, qrCodeId, limit);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const title = isDashboard 
    ? qrCodeId 
      ? "QR Code Tips" 
      : "Recent Tips" 
    : `${authorName}'s Activity`;
  
  return (
    <Card className="p-6 px-[25px] rounded-sm">
      <TipHistoryHeader
        title={title}
        isDashboard={isDashboard}
        tips={tips}
        likes={likes}
        comments={comments}
        qrCodeId={qrCodeId}
        showHeader={showHeader && !limit}
      />

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

      <TipDetailsDialog 
        isOpen={!!selectedTip} 
        onClose={() => setSelectedTip(null)} 
        tip={selectedTip} 
      />
    </Card>
  );
};
