
import { useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StripeOnboardingStatusProps {
  className?: string;
}

export const StripeOnboardingStatus = ({ className }: StripeOnboardingStatusProps) => {
  const [open, setOpen] = useState(false);

  // Detect if user is on mobile for tap-to-open
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleTriggerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) {
      e.preventDefault();
      setOpen((prev) => !prev);
      // Auto-close after 3s
      setTimeout(() => setOpen(false), 3000);
    }
  }, [isMobile]);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isMobile ? open : undefined}>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 text-sm font-medium ${className} cursor-pointer`}
            onClick={handleTriggerClick}
            tabIndex={0}
            aria-label="Stripe onboarding status"
            role="button"
          >
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
