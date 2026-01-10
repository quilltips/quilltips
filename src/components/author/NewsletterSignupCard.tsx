import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Mail, CheckCircle } from "lucide-react";

interface NewsletterSignupCardProps {
  authorId: string;
  description: string;
}

export const NewsletterSignupCard = ({ authorId, description }: NewsletterSignupCardProps) => {
  const [formData, setFormData] = useState({
    subscriber_name: '',
    subscriber_email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subscriber_email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('author_newsletter_signups')
        .insert([{
          author_id: authorId,
          subscriber_name: formData.subscriber_name || null,
          subscriber_email: formData.subscriber_email
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to the newsletter",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      // Send email notification to author
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'newsletter_signup',
            userId: authorId,
            data: {
              subscriberName: formData.subscriber_name,
              subscriberEmail: formData.subscriber_email
            }
          }
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the submission if email fails
      }

      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "You've been subscribed to the newsletter"
      });
    } catch (error) {
      console.error('Error submitting newsletter signup:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe to newsletter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold text-foreground">Successfully Subscribed!</h3>
            <p className="text-sm text-muted-foreground">
              You'll receive updates and news straight from the author.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
      
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletter-name">Name (Optional)</Label>
            <Input
              id="newsletter-name"
              placeholder="Your name"
              value={formData.subscriber_name}
              onChange={(e) => setFormData(prev => ({ ...prev, subscriber_name: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newsletter-email">Email *</Label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.subscriber_email}
              onChange={(e) => setFormData(prev => ({ ...prev, subscriber_email: e.target.value }))}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner /> : "Subscribe to author updates"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};