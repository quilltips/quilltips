
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { StyledQRCode } from "@/components/qr/StyledQRCode";

const HowItWorks = () => {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-playfair font-medium text-center mb-12">How Quilltips Works</h1>
        
        <div className="space-y-10">
          {/* Top explanation section */}
          <div className="space-y-6">
            <p className="text-lg">
              Quilltips connects readers directly with authors through QR codes printed on books. It's simple, seamless, and meaningful:
            </p>
          </div>
          
          {/* Steps section with grid layout */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-8 order-2 md:order-1">
              <div className="space-y-3">
                <h2 className="text-2xl font-playfair font-medium">For Authors</h2>
                <ol className="list-decimal list-inside space-y-4 pl-2">
                  <li className="text-lg">
                    <span className="font-medium">Create a Quilltips account</span> 
                    <p className="text-base ml-6 mt-1">Sign up and set up your author profile.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Purchase a QR code</span>
                    <p className="text-base ml-6 mt-1">Each QR code creates a unique virtual tip jar for your book.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Add the QR code to your book</span>
                    <p className="text-base ml-6 mt-1">Work with your publisher to print it directly on the cover or inside the book.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Receive tips and messages</span>
                    <p className="text-base ml-6 mt-1">Connect with readers and collect support directly.</p>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-playfair font-medium">For Readers</h2>
                <ol className="list-decimal list-inside space-y-4 pl-2">
                  <li className="text-lg">
                    <span className="font-medium">Scan the QR code</span>
                    <p className="text-base ml-6 mt-1">Use your phone camera to scan the Quilltips QR code on a book.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Send a tip</span>
                    <p className="text-base ml-6 mt-1">Choose an amount that feels right to you.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Leave a message</span>
                    <p className="text-base ml-6 mt-1">Share your thoughts about the book with the author.</p>
                  </li>
                </ol>
              </div>
            </div>
            
            {/* Image display */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden order-1 md:order-2">
              <img 
                src="/lovable-uploads/c4aecd92-9560-449a-a7f7-0f9d034fa4ab.png" 
                alt="Quilltips tipping interface" 
                className="w-full h-auto"
              />
              <div className="p-4 text-center text-sm text-gray-600">
                Example of the reader tipping interface after scanning a QR code
              </div>
            </div>
          </div>
          
          {/* QR code explanation */}
          <div className="bg-gray-50 p-6 rounded-xl my-12">
            <h2 className="text-2xl font-playfair font-medium mb-4">About QR Codes</h2>
            <div className="md:flex items-center gap-8">
              <div className="mb-6 md:mb-0 flex justify-center">
                <StyledQRCode value="https://quilltips.com/example" size={160} />
              </div>
              <div className="space-y-4">
                <p className="text-lg">
                  A QR code is like a barcode that readers can scan to open your virtual Quilltips Jar. Any author can create a QR code for a book using Quilltips.
                </p>
                <p className="text-lg">
                  After you purchase the QR code, we generate a virtual Quilltips Jar associated with the QR code where readers can leave a tip and a message about the book.
                </p>
                <p className="text-lg">
                  You'll be able to access valuable reader information across all your Quilltip jars (such as emails and locations).
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link 
            to="/author/create-qr" 
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] py-4 px-8 rounded-full font-medium text-lg"
          >
            Create a QR code
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default HowItWorks;
