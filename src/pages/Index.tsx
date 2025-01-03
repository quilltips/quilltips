import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-enter">
          <h1 className="text-4xl font-bold">Connect with Authors Through Books</h1>
          <p className="text-xl text-muted-foreground">
            Support your favorite authors directly and share your thoughts about their books
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <Card className="glass-card p-6 text-center space-y-4 hover-lift">
            <Search className="h-8 w-8 mx-auto" />
            <h3 className="font-semibold">Find Authors</h3>
            <p className="text-sm text-muted-foreground">
              Search for your favorite authors and their books
            </p>
          </Card>

          <Card className="glass-card p-6 text-center space-y-4 hover-lift">
            <QrCode className="h-8 w-8 mx-auto" />
            <h3 className="font-semibold">Scan & Connect</h3>
            <p className="text-sm text-muted-foreground">
              Scan the QR code in your book to connect instantly
            </p>
          </Card>

          <Card className="glass-card p-6 text-center space-y-4 hover-lift">
            <BookOpen className="h-8 w-8 mx-auto" />
            <h3 className="font-semibold">Share & Support</h3>
            <p className="text-sm text-muted-foreground">
              Send messages and support directly to authors
            </p>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link to="/author/register">
            <Button size="lg" className="hover-lift">
              Register as an Author
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;