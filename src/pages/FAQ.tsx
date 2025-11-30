import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Meta } from "@/components/Meta"; 

const FAQ = () => {
  return (
    <>
    <Meta
      title="Quilltips - Frequently Asked Questions"
      description="Got questions about how tipping, QR codes, or author payouts work? Check out our FAQ for quick answers."
      url="https://quilltips.co/faq"
    />

    <div className="container mx-auto px-4 py-8 md:py-16 flex-grow">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-16 text-center font-playfair">Frequently Asked Questions</h1>
        
        <div className="space-y-12">
          {/* General FAQs */}
          <div className="space-y-6">
           
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-quilltips">
                <AccordionTrigger>What is Quilltips?</AccordionTrigger>
                <AccordionContent>
                  Quilltips is a platform that lets readers connect with authors through QR 
                  codes printed on books.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-it-works">
                <AccordionTrigger>How does it work?</AccordionTrigger>
                <AccordionContent>
                  Authors create QR codes for their books through our platform. When readers scan these QR codes, they're 
                  taken to a custom book page where they can view a video from the author, see art related to the book, write messages, leave tips for the author, and more! Authors can like and reply to messages - it's like signing autographs from your couch. 
                  <br /><br />
                  <Link to="/how-it-works" className="text-[#19363C] underline">See more about how Quilltips works</Link>.
                </AccordionContent>
              </AccordionItem>
              
    
        
              
              <AccordionItem value="qr-code-cost">
                <AccordionTrigger>How much does a Quilltips Jar cost?</AccordionTrigger>
                <AccordionContent>
                  Create and publish your author profile for free. We only charge to create QR codes and facilitate tips. Each QR code you create costs $35 (we call these Quilltips Jars), and we take a 5% platform fee on tip income. Our payments partner, Stipe, also charges a processing fee. 
                  <br /><br />
                  <Link to="/pricing" className="text-[#19363C] underline">Find out more about pricing</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="separate-jar-for-book">
                <AccordionTrigger>Do I need a separate Quilltips Jar for each book?</AccordionTrigger>
                <AccordionContent>
                  Yes, each Quilltips Jar corresponds to a specific book and links to the individual book page in your public profile. 
                </AccordionContent>
              </AccordionItem>
              
              
              <AccordionItem value="add-qr-to-book">
                <AccordionTrigger>I've created my QR code - how should I add it to my book?</AccordionTrigger>
                <AccordionContent>
                  Great job! After purchasing your QR code, you can download it in PNG or SVG format and share it with your publisher or cover designer if necessary. We recommend adding the QR code to your book jacket (front or back cover) or to your About the Author page. To ensure scan-ability, the QR code should be no less than 1 inch by 1 inch in size, which translates to 300x300 pixels at standard print resolution (300 PPI). After you've added it to your book, the rest is up to us and your readers!
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="collect-payments">
                <AccordionTrigger>How can I collect tips?</AccordionTrigger>
                <AccordionContent>
                  During the account creation process, you'll be asked to set up a Stripe Connect account so you can link your preferred bank account. After this is done, you can receive tips directly from readers through your book page. For detailed guidance on the Stripe setup process, visit our <Link to="/stripe-help" className="text-[#19363C] underline">Stripe setup guide</Link>.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="communicate-with-readers">
                <AccordionTrigger>Can I communicate with my readers through the platform?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! Readers can send you messages from your book page after scanning your QR code. You can like and reply to messages right from your dashboard.
                </AccordionContent>
              </AccordionItem>
              
              

              <AccordionItem value="e-books">
                <AccordionTrigger>Can I put QR codes in E-books or other materials?</AccordionTrigger>
                <AccordionContent>
                  Certainly! Feel free to place your QR Code in your e-book or on other book-related marketing materials. Just note that the QR code links back to your specific book page. And, always make sure you test the QR code before distributing it widely. 
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
          
          {/* Reader FAQs */}
          <div className="space-y-6">
            <h2 className="text-2xl font-playfair font-medium">For Readers</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-use-as-reader">
                <AccordionTrigger>How can I use Quilltips as a reader?</AccordionTrigger>
                <AccordionContent>
                  Readers can scan Quilltips QR codes on their books to engage with the author by opening your phone's camera app and pointing at the QR code, or can search for authors and books on the Quilltips website.
                </AccordionContent>
              </AccordionItem>
              
              
              <AccordionItem value="reader-info-shared">
                <AccordionTrigger>I'm a reader - what information is shared with the author and with other readers?</AccordionTrigger>
                <AccordionContent>
                  In addition to your message and optional tip, by agreeing to the Quilltips terms of service, your email is shared with the author.
                  <br /><br />
                  Read more in the 
                  <Link to="/terms" className="text-[#19363C] underline"> terms of service</Link> and <Link to="/privacy" className="text-[#19363C] underline">privacy policy</Link>.
                </AccordionContent>
              </AccordionItem>
              
              
              <AccordionItem value="reader-account">
                <AccordionTrigger>Do I need to create an account to tip an author?</AccordionTrigger>
                <AccordionContent>
                  No, you don't need to create an account to tip an author. You can leave a tip as a guest by entering your 
                  payment information securely. 
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="payment-security">
                <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, all payments are processed securely through Stripe, a leading payment processor used by millions of 
                  businesses worldwide. We never store your credit card information on our servers. 
                </AccordionContent>
              </AccordionItem>
              
          
            </Accordion>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default FAQ;
