import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface InitialRegistrationFieldsProps {
  isLoading: boolean;
  onNext: (email: string, password: string) => void;
}

export const InitialRegistrationFields = ({
  isLoading,
  onNext
}: InitialRegistrationFieldsProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast({
        title: "Agreement required",
        description: "You must agree to the Terms and Privacy Policy to create an account.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    onNext(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Create account</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Enter your email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            className="hover-lift"
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          disabled={isLoading}
          className="mt-1"
        />
        <div className="text-sm font-normal leading-tight">
          I agree to the{" "}
          <Link
            to="/terms"
            className="text-[#2D3748] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="text-[#2D3748] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
      >
        Next
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already signed up?{" "}
          <Link to="/author/login" className="text-[#2D3748] hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </form>
  );
};
