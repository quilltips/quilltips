
import { Card, CardContent } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";

interface BookStatsProps {
  totalBooks: number;
}

export const BookStats = ({ totalBooks }: BookStatsProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6 bg-[#19363C] text-white min-h-[200px] flex flex-col">
        <div className="flex-1 space-y-6">
          <h2 className="text-xl md:text-2xl font-playfair text-left">My books</h2>
          
          <div className="flex items-center justify-between flex-1">
            <div className="text-3xl md:text-4xl font-bold text-[#FFD166]">
              {totalBooks}
            </div>
            
            <div className="bg-[#FFD166] rounded-full p-3 md:p-4">
              <BookOpenText className="h-6 w-6 md:h-8 md:w-8 text-[#19363C]" />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs md:text-sm font-normal text-white">Books</div>
          </div>
          
          <p className="text-xs md:text-sm text-white/80 text-center leading-relaxed">
            Number of books with an associated Quilltips Jar
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
