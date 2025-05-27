
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface TopBook {
  id: string;
  book_title: string;
  tipCount: number;
}

interface TopBooksProps {
  topBooks: TopBook[];
}

export const TopBooks = ({ topBooks }: TopBooksProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6 bg-[#19363C] text-white min-h-[200px] flex flex-col">
        <div className="flex-1 space-y-6">
          <h2 className="text-xl md:text-2xl font-playfair text-left">Top Books</h2>
          
          <div className="flex-1 space-y-3">
            {topBooks.length > 0 ? (
              topBooks.slice(0, 3).map((book, index) => (
                <div key={book.id} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFD166] text-[#19363C] text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium truncate max-w-[150px] md:max-w-[200px]">
                      {book.book_title}
                    </span>
                  </div>
                  <span className="text-[#FFD166] font-bold text-sm">
                    {book.tipCount} tips
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <Trophy className="h-8 w-8 text-[#FFD166] mb-2" />
                <p className="text-sm text-white/70">No tips received yet</p>
              </div>
            )}
          </div>
          
          <p className="text-xs md:text-sm text-white/80 text-center leading-relaxed">
            Your most popular books by tip count
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
