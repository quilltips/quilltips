import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle } from "lucide-react";

interface BookClubInviteCardProps {
  authorId: string;
  description: string;
}

export const BookClubInviteCard = ({ authorId, description }: BookClubInviteCardProps) => {
  const [formData, setFormData] = useState({
    reader_name: '',
    reader_email: '',
    event_type: 'book_club',
    event_date: '',
    event_location: '',
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
        .from('book_club_invites')
        .insert([{
          author_id: authorId,
          reader_name: formData.reader_name,
          reader_email: formData.reader_email,
          event_type: formData.event_type,
          event_date: formData.event_date || null,
          event_location: formData.event_location || null,
          message: formData.message || null
        }]);

      if (error) throw error;

      // Send email notification to author
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'book_club_invite',
            userId: authorId,
            data: {
              readerName: formData.reader_name,
              readerEmail: formData.reader_email,
              eventType: formData.event_type,
              eventDate: formData.event_date,
              eventLocation: formData.event_location,
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
        title: "Success",
        description: "Your invitation has been sent to the author"
      });
    } catch (error) {
      console.error('Error submitting book club invite:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
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
            <h3 className="font-semibold text-foreground">Invitation Sent</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for the invitation. The author will review your request and get back to you soon.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#f8f6f2]">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bc-reader-name">Your Name *</Label>
              <Input
                id="bc-reader-name"
                placeholder=""
                value={formData.reader_name}
                onChange={(e) => setFormData(prev => ({ ...prev, reader_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-reader-email">Your Email *</Label>
              <Input
                id="bc-reader-email"
                type="email"
                placeholder=""
                value={formData.reader_email}
                onChange={(e) => setFormData(prev => ({ ...prev, reader_email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bc-event-type">Event Type</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
            >
              <SelectTrigger id="bc-event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="book_club">Book Club Meeting</SelectItem>
                <SelectItem value="virtual_event">Virtual Event</SelectItem>
                <SelectItem value="in_person_event">In-Person Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bc-event-date">Event Date (Optional)</Label>
              <Input
                id="bc-event-date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-event-location">Location (Optional)</Label>
              <Input
                id="bc-event-location"
                placeholder=""
                value={formData.event_location}
                onChange={(e) => setFormData(prev => ({ ...prev, event_location: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bc-message">Tell us about your event (Optional)</Label>
            <Textarea
              id="bc-message"
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
            {isSubmitting ? <LoadingSpinner /> : "Send Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
