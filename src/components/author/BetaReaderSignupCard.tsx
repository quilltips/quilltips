import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Users, CheckCircle } from "lucide-react";

interface BetaReaderSignupCardProps {
  authorId: string;
  description: string;
}

export const BetaReaderSignupCard = ({ authorId, description }: BetaReaderSignupCardProps) => {
  const [formData, setFormData] = useState({
    reader_name: '',
    reader_email: '',
    reading_experience: '',
    favorite_genres: '',
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
        .from('beta_reader_signups')
        .insert([{
          author_id: authorId,
          reader_name: formData.reader_name,
          reader_email: formData.reader_email,
          reading_experience: formData.reading_experience || null,
          favorite_genres: formData.favorite_genres || null,
          message: formData.message || null
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Your beta reader application has been submitted successfully"
      });
    } catch (error) {
      console.error('Error submitting beta reader signup:', error);
      toast({
        title: "Error",
        description: "Failed to submit beta reader application. Please try again.",
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
            <h3 className="font-semibold text-foreground">Beta Reader Application Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for applying! The author will review your application and contact you if you're selected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Become a Beta Reader</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beta-name">Name *</Label>
              <Input
                id="beta-name"
                placeholder="Your full name"
                value={formData.reader_name}
                onChange={(e) => setFormData(prev => ({ ...prev, reader_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-email">Email *</Label>
              <Input
                id="beta-email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.reader_email}
                onChange={(e) => setFormData(prev => ({ ...prev, reader_email: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reading-experience">Reading Experience</Label>
            <Input
              id="reading-experience"
              placeholder="e.g., Avid reader, Former editor, Book blogger..."
              value={formData.reading_experience}
              onChange={(e) => setFormData(prev => ({ ...prev, reading_experience: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favorite-genres">Favorite Genres</Label>
            <Input
              id="favorite-genres"
              placeholder="e.g., Fantasy, Romance, Mystery, Sci-Fi..."
              value={formData.favorite_genres}
              onChange={(e) => setFormData(prev => ({ ...prev, favorite_genres: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beta-message">Why do you want to be a beta reader?</Label>
            <Textarea
              id="beta-message"
              placeholder="Tell the author about your reading background and why you'd be a great beta reader..."
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
            {isSubmitting ? <LoadingSpinner /> : "Apply to be a Beta Reader"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};