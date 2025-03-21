
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

interface PasswordResetFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

export const PasswordResetForm = ({ 
  email, 
  setEmail, 
  isLoading, 
  error, 
  onSubmit, 
  onBack 
}: PasswordResetFormProps) => {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      {error && <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resetEmail">Email</Label>
          <Input 
            id="resetEmail" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={isLoading} 
            className="hover-lift bg-white/50" 
            placeholder="Enter your email" 
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-[#2D3748]" 
          disabled={isLoading}
        >
          {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>
        <button 
          type="button" 
          onClick={onBack} 
          className="text-sm text-muted-foreground hover:text-[#2D3748] w-full text-center"
        >
          Back to login
        </button>
      </form>
    </div>
  );
};
