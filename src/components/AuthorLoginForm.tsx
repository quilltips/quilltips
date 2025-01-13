import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AuthorLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      if (!data?.user) {
        console.error("No user data returned");
        throw new Error("No user data returned");
      }

      // Check if profile exists, if not create it
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log("No profile found, creating one");
        const { error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id,
            name: data.user.user_metadata.name || data.user.email,
            bio: data.user.user_metadata.bio,
            role: data.user.user_metadata.role || 'author'
          }]);

        if (createError) throw createError;
      }

      console.log("Login successful:", data.user);

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      navigate("/author/dashboard");
    } catch (error: any) {
      console.error("Caught error:", error);
      toast({
        title: "Error",
        description: error?.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/author/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
      setResetEmail("");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: error?.message || "An error occurred while requesting password reset",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="glass-card p-6 max-w-md mx-auto animate-enter">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Author Login</h2>
          <p className="text-muted-foreground">
            Welcome back! Sign in to manage your profile and tips
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={isLoading}
              className="hover-lift"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="hover-lift"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full hover-lift"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t">
        <h3 className="text-sm font-medium mb-4">Forgot your password?</h3>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resetEmail">Email</Label>
            <Input
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              disabled={isResetting}
              className="hover-lift"
              placeholder="Enter your email"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full hover-lift"
            disabled={isResetting}
          >
            {isResetting ? "Sending Reset Link..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </Card>
  );
};