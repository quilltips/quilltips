
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { AuthorPublicTipFeed } from "@/components/tips/AuthorPublicTipFeed";

interface AuthorProfileContentProps {
  authorId: string;
  authorName: string;
}

export const AuthorProfileContent = ({
  authorId,
  authorName
}: AuthorProfileContentProps) => {
  return <div className="space-y-8">
      {/* Books Section - Previously "Quilltips Jars", now appears first */}
      <Card className="border border-[#19363C]/50 shadow-sm rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">Books</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorQRCodes authorId={authorId} authorName={authorName} />
        </CardContent>
      </Card>
      
      {/* Tip Feed Section - Now comes second */}
      <Card className="border border-[#19363C]/50 shadow-sm rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">Tip feed</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorPublicTipFeed authorId={authorId} />
        </CardContent>
      </Card>
      
      {/* Tip Guidance Text */}
      <p className="text-sm text-[#718096] text-center mt-4">
        To send a tip, simply select a book from the Book section above and click the "Leave a tip!" button!
      </p>
    </div>;
};

