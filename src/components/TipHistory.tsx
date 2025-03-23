
import { TipHistoryContainer } from "./tips/TipHistoryContainer";

interface TipHistoryProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
  isDashboard?: boolean;
  authorName?: string;
  customTitle?: string;
}

export const TipHistory = ({
  authorId,
  qrCodeId,
  limit,
  isDashboard,
  authorName,
  customTitle
}: TipHistoryProps) => {
  return (
    <TipHistoryContainer
      authorId={authorId}
      qrCodeId={qrCodeId}
      limit={limit}
      isDashboard={isDashboard}
      authorName={authorName}
      customTitle={customTitle}
    />
  );
};
