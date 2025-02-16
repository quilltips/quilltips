
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 pt-16 pb-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-enter">
          <div className="space-y-4">
            <img src="/lovable-uploads/8718ff3b-2170-4226-b088-575917507a51.png" alt="Quilltips" className="h-12 mx-auto" />
            <h1 className="text-4xl font-playfair font-medium">Quilltips</h1>
            <h2 className="text-muted-foreground mx-[62px] px-[4px] text-xl py-[24px]">
              Helping authors get paid
            </h2>
          </div>

          <Link to="/author/register">
            <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]">
              Create an account
            </Button>
          </Link>
        </div>

        {/* Connecting Authors Section */}
        <div className="max-w-4xl mx-auto mt-24 text-center space-y-6">
          <h2 className="text-4xl font-playfair font-medium">A virtual tip jar to connect authors with readers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            With Quilltips, authors can add a QR code to their books for readers to scan. Scanning opens a Quilltip Jar, where readers can leave a tip and message!
          </p>
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

        {/* Why Quilltips Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-4xl font-playfair font-medium text-center mb-12">Why Quilltips?</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-lg text-muted-foreground space-y-4 text-left">
              <p>
                Fair author compensation is really hard to achieve given the structure of the book industry, where royalties on primary sales are super low and royalties on used books and library copies are nonexistent.
              </p>
              <p>
                With the growth of e-commerce platforms such as Amazon, books can have an active and adventurous life for years after they are printed, providing joy to readers in an environmentally sustainable and accessible way.
              </p>
              <p>
                Most readers would be happy to directly support their favorite authors, if only there was a way to do this! This is the idea that hatched Quilltips, and why we are working hard to create a platform that supports fair author compensation and connecting authors directly with their audience.
              </p>
              <p>
                Join us on our journey, and launch your first Quilltips Jar today!
              </p>
            </div>
            <div className="relative w-full h-full flex justify-center items-center">
              <img src="/lovable-uploads/98a4ed1e-68c9-4e60-b65b-f6d2d3d15d53.png" alt="Quilltips mobile app preview showing tip feed and QR codes" className="w-full max-w-md" />
            </div>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="max-w-4xl mx-auto mt-24 text-center space-y-8 animate-enter">
          <div className="space-y-4">
            <h2 className="text-4xl font-playfair font-medium">Get started</h2>
            <h3 className="text-muted-foreground mx-[62px] px-[4px] text-xl py-[24px]">
              Create an account to connect with readers and collect tips!
            </h3>
          </div>
          <Link to="/author/register">
            <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]">
              Create an account
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
