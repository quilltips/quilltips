
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
        <p className="">
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
            className=" bg-white/50" 
            placeholder="Enter your email" 
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-[#FFD166] hover:shadow-lg text-[#333333] hover:bg-[#ffd166]" 
          disabled={isLoading}
        >
          {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>
        <button 
          type="button" 
          onClick={onBack} 
          className="text-sm hover:text-[#333333] hover:underline w-full text-center"
        >
          Back to login
        </button>
      </form>
    </div>
  );
};
