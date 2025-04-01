import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { useToast } from "@/hooks/use-toast";

export const AccountCredentials = () => {
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentEmail(data.user.email || "");
      }
    };
    
    fetchUserEmail();
  }, []);

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600">{currentEmail}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsEmailOpen(true)}
              className="px-8 py-2 h-auto rounded-full"
            >
              Change Email
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-gray-600">••••••••</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordOpen(true)}
              className="px-8 py-2 h-auto rounded-full"
            >
              Change Password
            </Button>
          </div>
        </div>
      )}

      {isEmailOpen && (
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="current-email">Current Email</Label>
            <Input
              id="current-email"
              type="email"
              value={currentEmail}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-1">
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
