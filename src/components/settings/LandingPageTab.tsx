import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Calendar, Users, BookOpen, Mail, RotateCcw } from "lucide-react";

interface LandingPageTabProps {
  profileId: string;
  onChangeStatus?: (hasChanges: boolean) => void;
}

interface LandingPageSettings {
  next_release_date: string | null;
  next_release_title: string | null;
  countdown_enabled: boolean;
  arc_signup_enabled: boolean;
  arc_signup_description: string | null;
  beta_reader_enabled: boolean;
  beta_reader_description: string | null;
  newsletter_enabled: boolean;
  newsletter_description: string | null;
}

export const LandingPageTab = ({ profileId, onChangeStatus }: LandingPageTabProps) => {
  const [settings, setSettings] = useState<LandingPageSettings>({
    next_release_date: null,
    next_release_title: null,
    countdown_enabled: true,
    arc_signup_enabled: false,
    arc_signup_description: null,
    beta_reader_enabled: false,
    beta_reader_description: null,
    newsletter_enabled: false,
    newsletter_description: null,
  });
  const [savedSettings, setSavedSettings] = useState<LandingPageSettings>(settings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  // Check for changes
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  useEffect(() => {
    onChangeStatus?.(hasChanges);
  }, [hasChanges, onChangeStatus]);

  useEffect(() => {
    fetchLandingPageSettings();
  }, [profileId]);

  const fetchLandingPageSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          next_release_date,
          next_release_title,
          countdown_enabled,
          arc_signup_enabled,
          arc_signup_description,
          beta_reader_enabled,
          beta_reader_description,
          newsletter_enabled,
          newsletter_description
        `)
        .eq('id', profileId)
        .single();

      if (error) throw error;

      const fetchedSettings = {
        next_release_date: data.next_release_date || null,
        next_release_title: data.next_release_title || null,
        countdown_enabled: data.countdown_enabled ?? true,
        arc_signup_enabled: data.arc_signup_enabled || false,
        arc_signup_description: data.arc_signup_description || null,
        beta_reader_enabled: data.beta_reader_enabled || false,
        beta_reader_description: data.beta_reader_description || null,
        newsletter_enabled: data.newsletter_enabled || false,
        newsletter_description: data.newsletter_description || null,
      };

      setSettings(fetchedSettings);
      setSavedSettings(fetchedSettings);
    } catch (error) {
      console.error('Error fetching landing page settings:', error);
      toast({
        title: "Error",
        description: "Failed to load landing page settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert empty strings to null before saving
      const cleanSettings = {
        next_release_date: settings.next_release_date || null,
        next_release_title: settings.next_release_title || null,
        countdown_enabled: settings.countdown_enabled,
        arc_signup_enabled: settings.arc_signup_enabled,
        arc_signup_description: settings.arc_signup_description || null,
        beta_reader_enabled: settings.beta_reader_enabled,
        beta_reader_description: settings.beta_reader_description || null,
        newsletter_enabled: settings.newsletter_enabled,
        newsletter_description: settings.newsletter_description || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(cleanSettings)
        .eq('id', profileId);

      if (error) throw error;

      setSavedSettings(settings);
      toast({
        title: "Success",
        description: "Landing page settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving landing page settings:', error);
      toast({
        title: "Error",
        description: "Failed to save landing page settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const resetSettings: LandingPageSettings = {
        next_release_date: null,
        next_release_title: null,
        countdown_enabled: false,
        arc_signup_enabled: false,
        arc_signup_description: null,
        beta_reader_enabled: false,
        beta_reader_description: null,
        newsletter_enabled: false,
        newsletter_description: null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(resetSettings)
        .eq('id', profileId);

      if (error) throw error;

      setSettings(resetSettings);
      setSavedSettings(resetSettings);
      toast({
        title: "Success",
        description: "Reader engagement settings have been reset"
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-md text-[#333333]">
          Enhance your public profile with these optional features! Once enabled, these will be displayed on your public profile. Simply link to your public profile from your author website or social media.
        </p>
      </div>

      {/* Release Countdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Next Release Countdown Clock</CardTitle>
          </div>
          <CardDescription>
            Display a countdown timer for your upcoming book release
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="countdown-enabled"
              checked={settings.countdown_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                countdown_enabled: checked
              }))}
            />
            <Label htmlFor="countdown-enabled">Enable countdown clock</Label>
          </div>
          {settings.countdown_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="release-title">Book Title</Label>
                <Input
                  id="release-title"
                  placeholder="Enter your upcoming book title"
                  value={settings.next_release_title || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    next_release_title: e.target.value.trim() || null
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release-date">Release Date</Label>
                <Input
                  id="release-date"
                  type="datetime-local"
                  value={formatDateForInput(settings.next_release_date)}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    next_release_date: e.target.value || null
                  }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ARC Signups */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>ARC (Advanced Reader Copy) Signups</CardTitle>
          </div>
          <CardDescription>
            Allow readers to sign up for advance copies of your book
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="arc-enabled"
              checked={settings.arc_signup_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                arc_signup_enabled: checked
              }))}
            />
            <Label htmlFor="arc-enabled">Enable ARC signups</Label>
          </div>
          {settings.arc_signup_enabled && (
            <div className="space-y-2">
              <Label htmlFor="arc-description">ARC Program Description</Label>
              <Textarea
                id="arc-description"
                placeholder="Describe your ARC program, requirements, and what readers can expect..."
                value={settings.arc_signup_description || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  arc_signup_description: e.target.value.trim() || null
                }))}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beta Reader Signups */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Beta Reader Signups</CardTitle>
          </div>
          <CardDescription>
            Recruit beta readers to provide feedback on your manuscript
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="beta-enabled"
              checked={settings.beta_reader_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                beta_reader_enabled: checked
              }))}
            />
            <Label htmlFor="beta-enabled">Enable beta reader signups</Label>
          </div>
          {settings.beta_reader_enabled && (
            <div className="space-y-2">
              <Label htmlFor="beta-description">Beta Reader Program Description</Label>
              <Textarea
                id="beta-description"
                placeholder="Describe what you're looking for in beta readers, timeline, and expectations..."
                value={settings.beta_reader_description || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  beta_reader_description: e.target.value.trim() || null
                }))}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Newsletter Signups */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>General Reader Signups</CardTitle>
          </div>
          <CardDescription>
            Allow readers to subscribe to your author updates (note, author is responsible for sending out their own updates, this is just an intake form)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="newsletter-enabled"
              checked={settings.newsletter_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                newsletter_enabled: checked
              }))}
            />
            <Label htmlFor="newsletter-enabled">Enable reader signups</Label>
          </div>
          {settings.newsletter_enabled && (
            <div className="space-y-2">
              <Label htmlFor="newsletter-description">Newsletter Description</Label>
              <Textarea
                id="newsletter-description"
                placeholder="Describe what readers can expect from your updates"
                value={settings.newsletter_description || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  newsletter_description: e.target.value.trim() || null
                }))}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 shrink-0 hover:bg-transparent hover:shadow-none hover:underline">
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Reader Engagement Settings</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your reader engagement settings including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Release countdown clock</li>
                  <li>ARC signup form and description</li>
                  <li>Beta reader signup form and description</li>
                  <li>Newsletter signup form and description</li>
                </ul>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleReset}
                disabled={isResetting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isResetting ? <LoadingSpinner /> : "Reset All Settings"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="min-w-32"
          >
            {isSaving ? <LoadingSpinner /> : "Save Changes"}
          </Button>
        )}
      </div>
    </div>
  );
};