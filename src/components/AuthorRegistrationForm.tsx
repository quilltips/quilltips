import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthorRegistrationFields } from "./AuthorRegistrationFields";

export const AuthorRegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            bio,
            role: "author"
          }
        }
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });

      navigate("/author/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
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

        <AuthorRegistrationFields isLoading={isLoading} />

        <Button
          type="submit"
          className="w-full hover-lift"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Author Account"}
        </Button>
      </form>
    </Card>
  );
};