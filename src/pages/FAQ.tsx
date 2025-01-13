import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
          
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
                Authors can create QR codes for their books through our platform. When readers scan these QR codes, they're 
                taken to the author's profile where they can leave tips, messages, and connect directly with the author.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="author-registration">
              <AccordionTrigger>How can I register as an author?</AccordionTrigger>
              <AccordionContent>
                Authors can register by clicking the "Register as Author" button on our homepage. You'll need to create an 
                account and verify your identity. Once registered, you can create QR codes for your books and start 
                receiving support from your readers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment-security">
              <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
              <AccordionContent>
                Yes, all payments are processed securely through Stripe, a leading payment processor. We never store your 
                credit card information on our servers. All transactions are encrypted and protected according to the 
                highest industry standards.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tip-amount">
              <AccordionTrigger>How much should I tip?</AccordionTrigger>
              <AccordionContent>
                The tip amount is entirely up to you. You can tip any amount you feel comfortable with based on how much 
                you enjoyed the book or want to support the author. There's no minimum or maximum amount.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;