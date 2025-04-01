
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { useToast } from "@/hooks/use-toast";

export const AccountCredentials = () => {
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      toast({
        title: "Email update initiated",
        description: "Please check your new email for a confirmation link.",
      });
      
      setIsEmailOpen(false);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to update email");
      console.error("Email update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }
      
      // Then update to the new password
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
      // Reset form
      setIsPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
      console.error("Password update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEmailChange = () => {
    setIsEmailOpen(false);
    setEmail("");
    setError(null);
  };

  const cancelPasswordChange = () => {
    setIsPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  return (
    <div className="space-y-6 border rounded-md p-6 bg-white">
      <h2 className="text-xl font-medium">Account Settings</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isEmailOpen && !isPasswordOpen && (
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            variant="outline" 
            onClick={() => setIsEmailOpen(true)}
            className="px-8 py-2 h-auto rounded-full"
          >
            Change Email
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsPasswordOpen(true)}
            className="px-8 py-2 h-auto rounded-full"
          >
            Change Password
          </Button>
        </div>
      )}

      {isEmailOpen && (
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">New Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter new email address"
              required
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={cancelEmailChange}
              className="px-8 py-2 h-auto rounded-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !email} 
              className="px-8 py-2 h-auto rounded-full bg-secondary text-primary hover:bg-secondary/90 font-medium"
            >
              {isLoading ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </form>
      )}

      {isPasswordOpen && (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={cancelPasswordChange}
              className="px-8 py-2 h-auto rounded-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword} 
              className="px-8 py-2 h-auto rounded-full bg-secondary text-primary hover:bg-secondary/90 font-medium"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
