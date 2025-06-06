
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";

interface InitialRegistrationFieldsProps {
  isLoading: boolean;
  onNext: (email: string, password: string) => void;
}

export const InitialRegistrationFields = ({
  isLoading,
  onNext
}: InitialRegistrationFieldsProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [tosError, setTosError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!termsAccepted) {
      setTosError("You must agree to the Terms and Privacy Policy to create an account.");
      return;
    }

    // Clear any existing TOS error
    setTosError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    onNext(email, password);
  };

  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked);
    // Clear error when user accepts terms
    if (checked && tosError) {
      setTosError(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Create account</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Enter your email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder=""
              required
              className=""
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Enter a password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder=""
              required
              minLength={8}
              className=" "
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(checked) => handleTermsChange(checked === true)}
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
          {tosError && (
            <p className="text-sm font-medium text-destructive ml-7">
              {tosError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
          data-plausible-event="initial-author-details"
        >
          Create an account
        </Button>

        <div className="text-center">
          <p className="text-sm">
            Already signed up?{" "}
            <Link to="/author/login" className="text-[#2D3748] font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
