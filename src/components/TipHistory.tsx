
import { TipHistoryContainer } from "./tips/TipHistoryContainer";

interface TipHistoryProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
  isDashboard?: boolean;
  authorName?: string;
}

export const TipHistory = ({
  authorId,
  qrCodeId,
  limit,
  isDashboard,
  authorName
}: TipHistoryProps) => {
  return (
    <TipHistoryContainer
      authorId={authorId}
      qrCodeId={qrCodeId}
      limit={limit}
      isDashboard={isDashboard}
      authorName={authorName}
    />
  );
};
