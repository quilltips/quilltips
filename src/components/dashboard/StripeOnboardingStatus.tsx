
import { CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StripeOnboardingStatusProps {
  className?: string;
}

export const StripeOnboardingStatus = ({ className }: StripeOnboardingStatusProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 text-sm font-medium ${className}`}>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="hidden sm:inline">Stripe onboarding complete</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <p>Your Stripe account has been set up and bank account linked successfully. You are now ready to receive payments from tips.</p>
          <p className="mt-2 text-xs">To change payment settings, use the Manage Payment Settings button in your Settings tab.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
