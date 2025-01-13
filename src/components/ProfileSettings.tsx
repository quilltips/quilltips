import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wallet, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface ProfileSettingsProps {
  profile: {
    id: string;
    name: string;
    bio: string;
    avatar_url?: string | null;
    stripe_account_id?: string | null;
  };
}

export const ProfileSettings = ({ profile }: ProfileSettingsProps) => {
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}-${Date.now()}.${fileExt}`;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });

      // Force a page reload to see the new avatar
      window.location.reload();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const connectBankAccount = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (!data?.url) {
        if (data?.error === 'Platform profile setup required') {
          throw new Error(data.details || 'Platform setup required');
        }
        throw new Error('No URL returned from Stripe');
      }

      // Save the Stripe account ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_account_id: data.accountId })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Redirect to Stripe Connect onboarding
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error connecting bank account:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect bank account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar_url || undefined} alt={name} />
            <AvatarFallback>{name?.charAt(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Picture
            </Button>
          </div>
        </div>

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