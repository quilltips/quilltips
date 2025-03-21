
import { TipDownloadButton } from "./TipDownloadButton";

interface TipHistoryHeaderProps {
  title: string;
  isDashboard?: boolean;
  tips: any[];
  likes: any[];
  comments: any[];
  qrCodeId?: string;
  showHeader?: boolean;
}

export const TipHistoryHeader = ({
  title,
  isDashboard,
  tips,
  likes,
  comments,
  qrCodeId,
  showHeader = true
}: TipHistoryHeaderProps) => {
  if (!showHeader || !isDashboard) return null;
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {isDashboard && (
          <TipDownloadButton 
            tips={tips} 
            likes={likes} 
            comments={comments} 
            qrCodeId={qrCodeId} 
          />
        )}
      </div>
    </div>
  );
};
