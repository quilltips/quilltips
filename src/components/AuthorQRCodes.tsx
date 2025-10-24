import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Loader2, Book, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { getBookUrl } from "@/lib/url-utils";

interface AuthorQRCodesProps {
  authorId: string;
  authorName: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
}

export const AuthorQRCodes = ({ 
  authorId, 
  authorName, 
  stripeSetupComplete = false, 
  hasStripeAccount = false 
}: AuthorQRCodesProps) => {
  const [showAll, setShowAll] = useState(false);

  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['qrCodes', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('author_id', authorId)
        .order('book_title', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!qrCodes?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center ">
            No books available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedQRCodes = showAll ? qrCodes : qrCodes.slice(0, 5);

  return (
    <div className="space-y-3">
      {displayedQRCodes.map((qrCode, index) => (
        <Link 
          key={qrCode.id}
          to={getBookUrl(qrCode)} 
          className="block group"
        >
          <Card className="transition-all hover:bg-[white]/70 ">
            <CardContent className="p-1">
              <div className={`flex items-center gap-3 py-3 pb-4 pl-2 ${index < displayedQRCodes.length - 1 ? 'border-b' : ''} hover:border-none`}>
                <div className="w-14 h-18 flex-shrink-0 rounded-sm overflow-hidden bg-white">
                  {qrCode.cover_image ? (
                    <img
                      src={qrCode.cover_image}
                      alt={qrCode.book_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#333333]/70">
                      <Book className="h-14 w-18" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-lg text-[#333333]">{qrCode.book_title}</h3>
                
                </div>
                <ChevronRight className="h-4 w-4 text-[#718096]" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {qrCodes.length > 5 && (
        <Button 
          variant="ghost" 
          onClick={() => setShowAll(!showAll)} 
          className="w-full text-[#718096] hover:underline hover:bg-[white]/70"
        >
          <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show Less' : `Show ${qrCodes.length - 5} More`}
        </Button>
      )}
    </div>
  );
};
