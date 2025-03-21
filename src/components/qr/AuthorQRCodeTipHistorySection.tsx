
import { Card } from "@/components/ui/card";
import { TipHistory } from "@/components/TipHistory";
import { TipDownloadButton } from "@/components/tips/TipDownloadButton";
import { TipData } from "@/hooks/use-qr-code-details-page";

interface AuthorQRCodeTipHistorySectionProps {
  tipData: TipData | undefined;
  authorId: string;
  qrCodeId: string | undefined;
}

export const AuthorQRCodeTipHistorySection = ({
  tipData,
  authorId,
  qrCodeId
}: AuthorQRCodeTipHistorySectionProps) => {
  if (!qrCodeId) return null;
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tip History</h2>
        {tipData && (
          <TipDownloadButton 
            tips={tipData.tips} 
            likes={tipData.likes} 
            comments={tipData.comments}
            qrCodeId={qrCodeId}
          />
        )}
      </div>
      <TipHistory authorId={authorId} qrCodeId={qrCodeId} isDashboard={true} />
    </Card>
  );
};
