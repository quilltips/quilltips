
import { TipHistoryContainer } from "./tips/TipHistoryContainer";

interface TipHistoryProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
  isDashboard?: boolean;
  authorName?: string;
  customTitle?: string;
  showHeader?: boolean;
}

export const TipHistory = ({
  authorId,
  qrCodeId,
  limit,
  isDashboard = true,
  authorName,
  customTitle,
  showHeader = true
}: TipHistoryProps) => {
  return (
    <TipHistoryContainer
      authorId={authorId}
      qrCodeId={qrCodeId}
      limit={limit}
      isDashboard={isDashboard}
      authorName={authorName}
      customTitle={customTitle}
      showHeader={showHeader}
    />
  );
};
