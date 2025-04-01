
import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FAQ = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center font-playfair">Frequently Asked Questions</h1>
          
          <Tabs defaultValue="general" className="w-full mt-8">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="authors">For Authors</TabsTrigger>
              <TabsTrigger value="readers">For Readers</TabsTrigger>
            </TabsList>
            
            {/* General FAQs */}
            <TabsContent value="general" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-quilltips">
                  <AccordionTrigger>What is Quilltips?</AccordionTrigger>
                  <AccordionContent>
                    Quilltips is a platform that enables readers to directly support and connect with authors through QR codes 
                    placed in books. It provides a way for readers to show appreciation for authors' work, especially when 
                    purchasing used books where authors don't receive royalties.
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
            </TabsContent>
            
            {/* Author FAQs */}
            <TabsContent value="authors" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="author-registration">
                  <AccordionTrigger>How can I register as an author?</AccordionTrigger>
                  <AccordionContent>
                    Authors can register by clicking the "Create an account" button on our homepage. You'll need to create an 
                    account and verify your identity. Once registered, you can create QR codes for your books and start 
                    receiving support from your readers.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="qr-code-cost">
                  <AccordionTrigger>How much does it cost to create a QR code?</AccordionTrigger>
                  <AccordionContent>
                    Each QR code costs $19.99. This is a one-time fee for the creation of the QR code. There are no recurring
                    subscription fees. After purchase, you can download the QR code to use in your books and marketing materials.
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
                
                <AccordionItem value="receive-payments">
                  <AccordionTrigger>How do I receive my tip payments?</AccordionTrigger>
                  <AccordionContent>
                    Tips are processed through Stripe, our secure payment processor. You'll need to connect your Stripe account
                    during registration. Payments are deposited directly to your bank account based on your Stripe payout schedule,
                    typically every 2-7 business days depending on your country.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="respond-to-readers">
                  <AccordionTrigger>Can I respond to reader messages?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Interacting with readers is a key feature of Quilltips. You can respond to reader messages through your 
                    dashboard. Building this connection can help you grow your readership and receive valuable feedback on your work.
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
            </TabsContent>
            
            {/* Reader FAQs */}
            <TabsContent value="readers" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="scan-qr-code">
                  <AccordionTrigger>How do I use a Quilltips QR code?</AccordionTrigger>
                  <AccordionContent>
                    Simply open your smartphone's camera app and point it at the QR code in the book. Your phone will recognize 
                    the code and prompt you to open the link. This will take you to the author's profile where you can learn more 
                    about them, leave a tip, and send a message.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tip-amount">
                  <AccordionTrigger>How much should I tip?</AccordionTrigger>
                  <AccordionContent>
                    The tip amount is entirely up to you. You can tip any amount you feel comfortable with based on how much 
                    you enjoyed the book or want to support the author. There's no minimum or maximum amount. Even small tips 
                    are greatly appreciated by authors.
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
                
                <AccordionItem value="personal-info">
                  <AccordionTrigger>What information do authors see when I tip?</AccordionTrigger>
                  <AccordionContent>
                    Authors can see your name (if provided), the tip amount, and your message. They'll also see generalized 
                    location data (city/country) for their analytics. If you create an account, authors may also see your profile 
                    picture if you've added one. We never share your payment details or personal contact information.
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
