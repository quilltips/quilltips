
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center font-playfair">Frequently Asked Questions</h1>
          
          <div className="space-y-12">
            {/* General FAQs */}
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-medium">General</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-quilltips">
                  <AccordionTrigger>What is Quilltips?</AccordionTrigger>
                  <AccordionContent>
                    Quilltips is a platform that lets readers directly support and connect with authors through QR 
                    codes printed on books. The platform gives readers a chance to show appreciation for authors' work, 
                    especially when purchasing used books where authors don't receive royalties.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-it-works">
                  <AccordionTrigger>How does it work?</AccordionTrigger>
                  <AccordionContent>
                    Authors create QR codes for their books through our platform. When readers scan these QR codes, they're 
                    taken to the author's profile where they can leave tips, messages, and connect directly with the author.
                    The QR code can be printed directly on book covers or inside the book. Readers can scan the code, learn
                    more about the author, leave a tip, and send a message of appreciation.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="why-quilltips">
                  <AccordionTrigger>Why was Quilltips created?</AccordionTrigger>
                  <AccordionContent>
                    Quilltips was created to address a gap in the book industry where authors often don't receive compensation
                    for used book sales or library borrowing. As the demand for used books grows, Quilltips provides a way for
                    readers to directly support their favorite authors while also fostering a meaningful connection between
                    readers and writers.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="data-privacy">
                  <AccordionTrigger>How does Quilltips handle data privacy?</AccordionTrigger>
                  <AccordionContent>
                    Quilltips takes data privacy seriously. We only collect information that's necessary to provide our 
                    service and with explicit user consent. Author and reader information is protected, and we never sell 
                    personal data to third parties. For complete details, please refer to our Privacy Policy.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* Author FAQs */}
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-medium">For Authors</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="how-use-as-author">
                  <AccordionTrigger>How can I use Quilltips as an author?</AccordionTrigger>
                  <AccordionContent>
                    Authors can create a Quilltips account where they can set up Quilltips jars and download QR codes to 
                    print on their books. Readers can leave tips and messages in an author's Quilltips jar. Quilltips jars 
                    can also leverage an author's bio, website, or other social media.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="qr-code-cost">
                  <AccordionTrigger>How much does a Quilltips jar cost?</AccordionTrigger>
                  <AccordionContent>
                    Creating a Quilltips jar costs $35. A Quilltips jar includes:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>A unique QR code that you can print on the cover of your next book for readers to scan.</li>
                      <li>A book-specific profile page on Quilltips where readers can leave you a tip and message.</li>
                      <li>A link between your Quilltips jar and your chosen payment option, secured by Stripe.</li>
                      <li>Data and insights directly from your readers to help you deepen engagement.</li>
                    </ul>
                    <p className="mt-2">In addition to the QR code cost, Quilltips charges a 5% fee on transactions. Our payment provider, Stripe, also charges a processing fee that readers have the option to cover.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="add-qr-to-book">
                  <AccordionTrigger>I've created my QR code - how should I add it to my book?</AccordionTrigger>
                  <AccordionContent>
                    Great job! We recommend adding the QR code to your book jacket (front or back cover) or to your About the Author page. To ensure scan-ability, the QR code should be no less than 2cm by 2cm in size. After you've added it to your book, the rest is up to us and your readers!
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="collect-payments">
                  <AccordionTrigger>How do I collect payments?</AccordionTrigger>
                  <AccordionContent>
                    During the account creation process, you'll be asked to set up a Stripe Connect account so you can link your preferred payment method. After this is done, you can receive tips directly from readers. For detailed guidance on the Stripe setup process, visit our <Link to="/stripe-help" className="text-[#19363C] underline">Stripe setup guide</Link>.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="communicate-with-readers">
                  <AccordionTrigger>Can I communicate with my readers through the platform?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely! When readers send a tip, they have the option to add a message. Authors can reply directly to their readers by commenting on their messages.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="author-registration">
                  <AccordionTrigger>How can I register as an author?</AccordionTrigger>
                  <AccordionContent>
                    Authors can register by clicking the "Create an account" button on our homepage. You'll need to create an 
                    account and verify your identity. Once registered, you can create QR codes for your books and start 
                    receiving support from your readers.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="qr-implementation">
                  <AccordionTrigger>How do I implement the QR code in my book?</AccordionTrigger>
                  <AccordionContent>
                    After purchasing a QR code, you can download it in various formats suitable for print. We recommend working 
                    with your publisher to include the QR code on the book cover or within the first few pages. For self-published 
                    authors, you can add the QR code to your book design before printing or use stickers for existing inventory.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="track-tips">
                  <AccordionTrigger>How do I track my tips and engagement?</AccordionTrigger>
                  <AccordionContent>
                    Your author dashboard provides detailed analytics on tips received, messages from readers, and engagement metrics 
                    for each of your QR codes. You can track which books are generating the most support and see reader feedback to 
                    help inform your future writing.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="custom-qr-designs">
                  <AccordionTrigger>Can I customize the design of my QR codes?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Quilltips offers several templates for QR code design. You can choose different styles, colors, and add your 
                    branding to make the QR code match your book's aesthetic. All QR codes maintain the Quilltips branding to ensure 
                    readers recognize the purpose of the code.
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
                    Readers can scan Quilltips QR codes on their books to show appreciation and message their authors directly, or can search for authors and books on Quilltips website.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reader-tip-amount">
                  <AccordionTrigger>As a reader, how much should I tip?</AccordionTrigger>
                  <AccordionContent>
                    This is totally up to you. We don't have any minimum tip, so you should tip whatever feels comfortable.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reader-info-shared">
                  <AccordionTrigger>I'm a reader - what information is shared with the author and with other readers?</AccordionTrigger>
                  <AccordionContent>
                    In addition to your tip and optional message, by agreeing to the Quilltips terms of service, your email is shared with the author. That said, your tip and message to private if you want to keep these communications to the author.
                    <br /><br />
                    We might also share generalized location data with the author so they know where their readers are. Check our terms of service for more information.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="scan-qr-code">
                  <AccordionTrigger>How do I use a Quilltips QR code?</AccordionTrigger>
                  <AccordionContent>
                    Simply open your smartphone's camera app and point it at the QR code in the book. Your phone will recognize 
                    the code and prompt you to open the link. This will take you to the author's profile where you can learn more 
                    about them, leave a tip, and send a message.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reader-account">
                  <AccordionTrigger>Do I need to create an account to tip an author?</AccordionTrigger>
                  <AccordionContent>
                    No, you don't need to create an account to tip an author. You can leave a tip as a guest by entering your 
                    payment information securely. However, creating an account allows you to track your tipping history and build 
                    a relationship with your favorite authors.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="payment-security">
                  <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, all payments are processed securely through Stripe, a leading payment processor used by millions of 
                    businesses worldwide. We never store your credit card information on our servers. All transactions are 
                    encrypted and protected according to the highest industry standards.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="author-response">
                  <AccordionTrigger>Will the author respond to my message?</AccordionTrigger>
                  <AccordionContent>
                    Most authors are excited to hear from readers and make an effort to respond to messages. However, response 
                    times may vary depending on the author's schedule and the volume of messages they receive. Your message and tip 
                    are always appreciated, even if you don't receive a direct response.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
