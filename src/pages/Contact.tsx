import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Meta } from "@/components/Meta"; 

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("contact-form", {
        body: { name, email, message }
      });

      if (error) {
        throw new Error(error.message || "Failed to submit form");
      }

      // Clear form fields
      setName("");
      setEmail("");
      setMessage("");
      
      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
    } catch (err: any) {
      console.error("Error submitting contact form:", err);
      setError(err.message || "There was a problem sending your message. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Meta
      title="Contact Quilltips – We're Here to Help"
      description="Need help setting up your account, uploading book covers, or creating QR codes? Reach out anytime."
      url="https://quilltips.co/contact"
    />

    <div className="flex-grow">
      <main className="container mx-auto px-4 py-8 md:py-16 lg:py-24 flex-grow">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6 gap-4">
            <OptimizedImage
              src="/lovable-uploads/logo_nav.png"
              alt="Book Icon"
              className="w-10 h-10"
              priority={true}
            />
            <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
          </div>
          
          <div className="prose mb-8">
            <p className="text-base md:text-lg text-gray-700">
              Have questions or feedback about Quilltips? Want to learn more about how we support authors? 
              We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                required
                rows={6}
                className="w-full min-h-[150px]"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] font-medium"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  <span>Sending...</span>
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
    </>
  );
};

export default Contact;
