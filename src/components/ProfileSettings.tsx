import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wallet } from "lucide-react";

interface ProfileSettingsProps {
  profile: {
    id: string;
    name: string;
    bio: string;
    stripe_account_id?: string | null;
  };
}

export const ProfileSettings = ({ profile }: ProfileSettingsProps) => {
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name, bio })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectBankAccount = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      const { url, accountId, error } = await response.json();

      if (error) throw new Error(error);

      // Save the Stripe account ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Redirect to Stripe Connect onboarding
      window.location.href = url;
    } catch (error) {
      console.error("Error connecting bank account:", error);
      toast({
        title: "Error",
        description: "Failed to connect bank account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about yourself"
              rows={4}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={connectBankAccount}
            disabled={isConnecting || !!profile.stripe_account_id}
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            {profile.stripe_account_id ? "Bank Account Connected" : "Connect Bank Account"}
          </Button>
        </div>
      </form>
    </Card>
  );
};