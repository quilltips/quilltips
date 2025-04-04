
import { Card, CardContent } from "@/components/ui/card";

interface TopBooksProps {
  topBooks: Array<{
    id: string;
    book_title: string;
    tipCount: number;
  }>;
}

export const TopBooks = ({ topBooks }: TopBooksProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 bg-[#19363C] text-white">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">Top books</h2>
          
          <div className="space-y-4">
            {topBooks.length > 0 ? (
              topBooks.map((book) => (
                <div key={book.id} className="flex justify-between items-center">
                  <div className="font-medium">{book.book_title}</div>
                  <div className="text-[#FFD166]">
                    {book.tipCount} {book.tipCount === 1 ? 'Tip' : 'Tips'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/70">
                No tips received yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
