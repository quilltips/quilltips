
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export const HowQRCodesWork = () => {
  return (
    <Card className="p-6 md:p-8 bg-white mt-10 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-[#19363C]" />
        <h2 className="text-2xl md:text-3xl font-medium text-[#19363C]">How do QR codes work?</h2>
      </div>
      
      <div className="space-y-6 text-gray-700">
        <p>
          A QR code is like a barcode that readers can scan to open your virtual Quilltips Jar. Any author can create a 
          QR code for a book using Quilltips. After you purchase the QR code, we generate a virtual Quilltips Jar 
          associated with the QR code where readers can leave a tip and a message about the book.
        </p>
        
        <p>
          Work with the publisher to get the QR code printed on the book. We recommend printing the QR code 
          directly on the cover or within the first few pages.
        </p>
        
        <p>
          You'll be able to access and download valuable reader information across all your Quilltip jars (such as 
          emails and locations).
        </p>
      </div>
    </Card>
  );
};
