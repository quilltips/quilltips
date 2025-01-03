import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClientComponentClient } from "@supabase/auth-helpers-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

export const AuthorRegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name as it appears on your books"
              required
              className="hover-lift"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              className="hover-lift"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a secure password"
              required
              minLength={8}
              className="hover-lift"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Input
              id="bio"
              name="bio"
              placeholder="Tell readers a bit about yourself"
              required
              className="hover-lift"
            />
          </div>
        </div>

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