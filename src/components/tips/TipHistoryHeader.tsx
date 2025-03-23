
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
  if (!showHeader) return null;
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-medium text-[#2D3748]">{title}</h2>
      {isDashboard && tips.length > 0 && (
        <TipDownloadButton 
          tips={tips} 
          likes={likes} 
          comments={comments} 
          qrCodeId={qrCodeId} 
        />
      )}
    </div>
  );
};
