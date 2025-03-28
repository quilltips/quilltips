
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-playfair font-medium text-center mb-12">How do QR codes work?</h1>
        
        <div className="space-y-6">
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
