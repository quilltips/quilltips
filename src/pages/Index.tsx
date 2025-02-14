
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, Share } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto px-4 pt-16 pb-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-enter">
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/8718ff3b-2170-4226-b088-575917507a51.png" 
            alt="Quilltips" 
            className="h-12 mx-auto"
          />
          <h1 className="text-4xl font-playfair font-medium">Quilltips</h1>
          <h2 className="text-muted-foreground mx-[62px] px-[4px] py-[5px] text-xl">
            Helping authors get paid
          </h2>
        </div>

        <Link to="/author/register">
          <Button 
            size="lg" 
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12"
          >
            Create an account
          </Button>
        </Link>
      </div>

      {/* How it works Section */}
      <div className="max-w-4xl mx-auto mt-24">
        <h2 className="text-3xl font-semibold text-center mb-16">How it works</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#FFD166]/10 flex items-center justify-center">
              <QrCode className="h-10 w-10 text-[#FFD166]" />
            </div>
            <h3 className="font-semibold text-lg">Create your Quilltip Jar</h3>
            <p className="text-muted-foreground">
              Generate a QR code for your book to include on the cover or inside the jacket.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#FFD166]/10 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-[#FFD166]" />
            </div>
            <h3 className="font-semibold text-lg">Meet your readers</h3>
            <p className="text-muted-foreground">
              Get tips and messages directly from your audience.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#FFD166]/10 flex items-center justify-center">
              <Share className="h-10 w-10 text-[#FFD166]" />
            </div>
            <h3 className="font-semibold text-lg">Simple linking</h3>
            <p className="text-muted-foreground">
              Direct readers to your website and socials, all from one place.
            </p>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="max-w-4xl mx-auto mt-24 text-center space-y-8">
        <h2 className="text-3xl font-semibold py-0">Get started</h2>
        <p className="text-lg text-muted-foreground py-[22px]">
          Create an account to connect with readers and collect tips!
        </p>
        <Link to="/author/register">
          <Button 
            size="lg" 
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12"
          >
            Create an account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
