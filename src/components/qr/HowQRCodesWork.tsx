
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

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
          associated with the QR code where readers can leave a tip and a message about the book. You can like and comment directly on these tips.
        </p>
        
        <p>
          Work with the publisher or designer to get the QR code printed on the book. We recommend printing the QR code 
          directly on the front or back cover or on the About the Author page. <strong>QR codes should be a minimum of 1 inch by 1 inch to ensure scannability, which translates to 300x300 pixels at standard print resolution (300 PPI).</strong> 
        </p>
        
        <p>
          You'll be able to access and download valuable reader information across all your Quilltips Jars from your Data page.
        </p>
        
        <p className="mt-4">
          <Link 
            to="/how-it-works" 
            className="text-[#19363C] underline hover:text-[#19363C]/80 transition-colors"
          >
            Learn more about how Quilltips works
          </Link>
        </p>
      </div>
    </Card>
  );
};
