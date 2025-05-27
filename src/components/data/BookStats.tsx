
import { Card, CardContent } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";

interface BookStatsProps {
  totalBooks: number;
}

export const BookStats = ({ totalBooks }: BookStatsProps) => {
  return (
    <Card className="overflow-hidden bg-[#19363C]">
      <CardContent className="p-6  text-white">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">My books</h2>
          
          <div className="flex justify-center gap-5 w-full">
            <div className="flex items-center ">
              <div className="flex flex-col items-center text-4xl font-bold text-[#FFD166]">
                {totalBooks}
                <div className="text-sm font-normal text-[#FFD166] mt-1">Books</div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-transparent rounded-full p-4">
                  <BookOpenText className="h-12 w-12 text-[#FFD166]" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <p className="text-sm text-white/80">
              Number of books with an associated Quilltips Jar
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
