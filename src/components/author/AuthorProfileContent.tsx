
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { TipHistory } from "@/components/TipHistory";

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
      <Card className="border border-black shadow-sm rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">Books</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorQRCodes authorId={authorId} authorName={authorName} />
        </CardContent>
      </Card>
      
      {/* Tip Feed Section - Now comes second */}
      <Card className="border border-black shadow-sm rounded-lg overflow-hidden" prominent>
        <CardHeader>
          <CardTitle className="text-xl text-[#2D3748]">Tip feed</CardTitle>
        </CardHeader>
        <CardContent>
          <TipHistory authorId={authorId} authorName={authorName} isDashboard={false} showHeader={false} />
        </CardContent>
      </Card>
    </div>;
};
