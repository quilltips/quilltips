import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, QrCode, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-enter">
          <h1 className="text-4xl font-bold">Connecting Authors And Readers</h1>
          <p className="text-xl text-muted-foreground">
            Engage with your most passionate fans, and allow them to show you love!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <Card className="glass-card p-6 text-center space-y-4 hover-lift">
            <QrCode className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Scan and paste</h3>
            <p className="text-sm text-muted-foreground">
              Build QR codes for your book and paste them on the cover or inside the jacket
            </p>
          </Card>

          <Card className="glass-card p-6 text-center space-y-4 hover-lift">
            <MessageSquare className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Meet your readers</h3>
            <p className="text-sm text-muted-foreground">
              Receive tips and messages directly from your most passionate readers
            </p>
          </Card>

          <Card className="glass-card p-6 text-center space-y-4 hover-lift">
            <BookOpen className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Simple linking</h3>
            <p className="text-sm text-muted-foreground">
              Link readers to your website and socials all from one place
            </p>
          </Card>
        </div>

        <div className="text-center mt-12 space-y-4">
          <Link to="/author/register">
            <Button size="lg" className="hover-lift">
              Register as an Author
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Start receiving support and connecting with your readers today
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
