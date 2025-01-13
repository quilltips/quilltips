import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "./ui/alert";

export const AuthorLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (!data?.user) {
        throw new Error("No user data returned");
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      // Create profile if it doesn't exist
      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name: data.user.email,
            role: 'author'
          }]);

        if (createError) throw createError;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      navigate("/author/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      toast({
        title: "Error",
        description: err.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsResetting(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        resetEmail,
        {
          redirectTo: `${window.location.origin}/author/reset-password`,
        }
      );

      if (resetError) throw resetError;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
      setResetEmail("");
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred while requesting password reset");
      toast({
        title: "Error",
        description: err.message || "An error occurred while requesting password reset",
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

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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