
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

interface LoginFormProps {
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResetClick: () => void;
}

export const LoginForm = ({ isLoading, error, onSubmit, onResetClick }: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Author Login</h2>
        <p className="">
          Welcome back! Sign in to manage your profile and tips
        </p>
      </div>

      {error && <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required disabled={isLoading} className=" bg-white/50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required disabled={isLoading} className=" bg-white/50" />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full text-[#2D3748] hover:bg-[#FFD166] bg-[#ffd166]">
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="space-y-2 text-center">
        <button 
          type="button" 
          onClick={onResetClick} 
          className="text-sm hover:text-[#2D3748]"
        >
          Forgot password?
        </button>
        
        <div className="pt-4 border-t">
          <p className="text-sm ">
            Don't have an account?{" "}
            <Link to="/author/register" className="text-[#2D3748] hover:underline font-bold">
              Register as Author
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

import { Link } from "react-router-dom";
