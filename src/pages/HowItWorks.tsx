
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { StyledQRCode } from "@/components/qr/StyledQRCode";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateQRCode = () => {
    if (!user) {
      // Redirect to login page instead of showing an error
      navigate("/author/login");
      return;
    }
    navigate("/author/create-qr");
  };
  
  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-playfair font-medium text-center mb-12">How Quilltips Works</h1>
        
        <div className="space-y-10">
          {/* Detailed explanation */}
          <div className="space-y-6">
            <p className="text-lg text-center">
              Quilltips connects readers directly with authors through QR codes printed on books. It's simple, seamless, and meaningful:
            </p>
          </div>
          
          {/* Detailed steps section */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-8 order-1">
              <div className="space-y-3">
                <h2 className="text-2xl font-playfair font-medium">For Authors</h2>
                <ol className="list-decimal list-inside space-y-4 pl-2">
                  <li className="text-lg">
                    <span className="font-medium">Create and download a QR code</span> 
                    <p className="text-base ml-6 mt-1">Generate a unique Quilltips QR code for your book.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Put it on your book</span>
                    <p className="text-base ml-6 mt-1">Work with your publisher to print the QR code on the cover or inside the book.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Reader scans it and sends a tip</span>
                    <p className="text-base ml-6 mt-1">Readers can easily support you by scanning the QR code.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Receive tips and connect with readers</span>
                    <p className="text-base ml-6 mt-1">Collect support and messages directly from your readers.</p>
                  </li>
                </ol>
              </div>
            </div>
            
            {/* QR code example */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden order-2 flex justify-center items-center p-6">
              <StyledQRCode 
                value="https://quilltips.com/example" 
                size={180} 
                className="mx-auto"
              />
            </div>
          </div>
          
          {/* How do QR codes work section from Figma */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-playfair font-medium text-center mb-6">How do QR codes work?</h2>
            
            <div className="space-y-4">
              <p className="text-lg">
                A QR code is like a barcode that readers can scan to open your virtual Quilltips Jar. Any author can create a QR code for a book using Quilltips. After you purchase the QR code, we generate a virtual Quilltips Jar associated with the QR code where readers can leave a tip and a message about the book.
              </p>
              
              <p className="text-lg">
                Work with the publisher to get the QR code printed on the book. We recommend printing the QR code directly on the cover or within the first few pages.
              </p>
              
              <p className="text-lg">
                You'll be able to access and download valuable reader information across all your Quilltip jars (such as emails and locations).
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex justify-center">
          <Button 
            onClick={handleCreateQRCode}
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] py-4 px-8 rounded-full font-medium text-lg"
          >
            Create a QR code
          </Button>
        </div>
      </main>
    </Layout>
  );
};

export default HowItWorks;
