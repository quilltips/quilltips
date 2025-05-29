
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Privacy Policy to create an account"
  })
});

interface InitialRegistrationFieldsProps {
  isLoading: boolean;
  onNext: (email: string, password: string) => void;
}

export const InitialRegistrationFields = ({
  isLoading,
  onNext
}: InitialRegistrationFieldsProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      termsAccepted: false
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onNext(values.email, values.password);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Create account</h2>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="email">Enter your email</Label>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="password">Enter a password</Label>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder=""
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="mt-1"
                  />
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
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
    </Form>
  );
};
