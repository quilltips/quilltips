
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { TipHistory } from "@/components/TipHistory";

interface AuthorProfileContentProps {
  authorId: string;
  authorName: string;
}

export const AuthorProfileContent = ({ authorId, authorName }: AuthorProfileContentProps) => {
  return (
    <>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Books</h2>
        <AuthorQRCodes 
          authorId={authorId} 
          authorName={authorName} 
        />
      </div>
      
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Tip History</h2>
        <TipHistory 
          authorId={authorId}
          authorName={authorName}
          isDashboard={false}
        />
      </div>
    </>
  );
};
