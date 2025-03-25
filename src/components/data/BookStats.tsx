
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "lucide-react";

interface BookStatsProps {
  totalBooks: number;
}

export const BookStats = ({ totalBooks }: BookStatsProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 bg-[#19363C] text-white">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">My books</h2>
          
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-[#FFD166]">
              {totalBooks}
              <div className="text-sm font-normal text-white mt-1">Books</div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-[#FFD166] rounded-full p-2 mr-2">
                <Book className="h-6 w-6 text-[#19363C]" />
              </div>
              <div className="flex">
                {['S', 'E', 'G'].map((letter, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#19363C] font-bold -ml-2 border-2 border-[#19363C]"
                    style={{ 
                      backgroundColor: i === 0 ? '#FF719A' : i === 1 ? '#5271FF' : '#64F4AC',
                      zIndex: 3 - i
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-white/80">
            Number of books with an associated Quilltips Jar
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
