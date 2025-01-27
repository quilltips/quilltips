import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, QrCode, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-4xl mx-auto text-center space-y-6 animate-enter">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#2D3748] to-[#4A5568] bg-clip-text text-transparent">
          Connecting Authors And Readers
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          QR codes for books that allow authors to engage with their most passionate readers, and build support!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <Card className="feature-card">
          <QrCode className="h-8 w-8 mx-auto text-[#FEC6A1]" />
          <h3 className="font-semibold mt-4 text-center">Scan and paste</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Build QR codes for your book and paste them on the cover or inside the jacket
          </p>
        </Card>

        <Card className="feature-card">
          <MessageSquare className="h-8 w-8 mx-auto text-[#FEC6A1]" />
          <h3 className="font-semibold mt-4 text-center">Meet your readers</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Receive tips and messages directly from your most passionate readers
          </p>
        </Card>

        <Card className="feature-card">
          <BookOpen className="h-8 w-8 mx-auto text-[#FEC6A1]" />
          <h3 className="font-semibold mt-4 text-center">Simple linking</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Link readers to your website and socials, all from one place
          </p>
        </Card>
      </div>

      <div className="text-center mt-12 space-y-4">
        <Link to="/author/register">
          <Button 
            size="lg" 
            className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200"
          >
            Register as an Author
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          Start receiving support and connecting with your readers today
        </p>
      </div>
    </div>
  );
};

export default Index;