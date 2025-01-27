import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ChevronDown, QrCode } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { QRCodeCardDetails } from "./QRCodeCardDetails";

interface QRCodeCardProps {
  qrCode: any;
  onNavigate: (id: string) => void;
}

export const QRCodeCard = ({ qrCode, onNavigate }: QRCodeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden transition-all duration-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
          <div className="flex items-center gap-3">
            <QrCode className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="font-semibold">{qrCode.book_title}</h3>
              <p className="text-sm text-muted-foreground">
                {qrCode.total_tips || 0} tips · ${qrCode.total_amount?.toFixed(2) || '0.00'} total
              </p>
            </div>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="animate-accordion-down">
          <QRCodeCardDetails qrCode={qrCode} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};