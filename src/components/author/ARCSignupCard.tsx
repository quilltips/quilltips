import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BookOpen, CheckCircle } from "lucide-react";

interface ARCSignupCardProps {
  authorId: string;
  description: string;
}

export const ARCSignupCard = ({ authorId, description }: ARCSignupCardProps) => {
  const [formData, setFormData] = useState({
    reader_name: '',
    reader_email: '',
    reader_location: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reader_name || !formData.reader_email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('arc_signups')
        .insert([{
          author_id: authorId,
          reader_name: formData.reader_name,
          reader_email: formData.reader_email,
          reader_location: formData.reader_location || null,
          message: formData.message || null
        }]);

      if (error) throw error;

      // Send email notification to author
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'arc_signup',
            userId: authorId,
            data: {
              readerName: formData.reader_name,
              readerEmail: formData.reader_email,
              readerLocation: formData.reader_location,
              message: formData.message
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
        description: "Your ARC request has been submitted successfully"
      });
    } catch (error) {
      console.error('Error submitting ARC signup:', error);
      toast({
        title: "Error",
        description: "Failed to submit ARC request. Please try again.",
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
            <h3 className="font-semibold text-foreground">ARC Request Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for your interest! The author will review your request and get back to you soon.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reader-name">Full Name *</Label>
              <Input
                id="reader-name"
                placeholder=""
                value={formData.reader_name}
                onChange={(e) => setFormData(prev => ({ ...prev, reader_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reader-email">Email *</Label>
              <Input
                id="reader-email"
                type="email"
                placeholder=""
                value={formData.reader_email}
                onChange={(e) => setFormData(prev => ({ ...prev, reader_email: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reader-location">Location (Optional)</Label>
            <Input
              id="reader-location"
              placeholder=""
              value={formData.reader_location}
              onChange={(e) => setFormData(prev => ({ ...prev, reader_location: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arc-message">Why are you interested? (Optional)</Label>
            <Textarea
              id="arc-message"
              placeholder=""
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner /> : "Request ARC Access"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};