import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthorRegistrationFields } from "./AuthorRegistrationFields";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";

export const AuthorRegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
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
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const socialLinks = JSON.parse(formData.get("socialLinks") as string || "[]");

    try {
      console.log("Starting registration process...");
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            bio,
            role: "author",
            social_links: socialLinks
          }
        }
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        
        if (signUpError.message === "User already registered") {
          throw new Error("This email is already registered. Please try logging in instead.");
        }
        
        throw signUpError;
      }

      console.log("Registration successful:", data);
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account. Next, you'll need to connect your bank account to receive tips.",
      });

      // Redirect to bank account connection page
      navigate("/author/bank-account");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
      
      toast({
        title: "Registration Failed",
        description: err.message === "User already registered" 
          ? "This email is already registered. Please try logging in instead."
          : err.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 max-w-md mx-auto animate-enter">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Register as an Author</h2>
          <p className="text-muted-foreground">
            Create an account to start receiving tips from your readers
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AuthorRegistrationFields isLoading={isLoading} />

        <Button
          type="submit"
          className="w-full hover-lift"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Author Account"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/author/login" className="text-primary hover:underline">
            Log in
          </a>
        </p>
      </form>
    </Card>
  );
};