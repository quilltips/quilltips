
import { X, HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "../ui/alert";
import { BankAccountConnect } from "../profile/BankAccountConnect";

interface BannerProps {
  onClose: () => void;
  hasStripeAccount: boolean;
  stripeSetupComplete: boolean;
  profileId?: string;
  stripeAccountId?: string | null;
}

export const Banner = ({ 
  onClose, 
  hasStripeAccount, 
  stripeSetupComplete,
  profileId,
  stripeAccountId 
}: BannerProps) => {
  const navigate = useNavigate();

  const showMissingStripe = !hasStripeAccount;
  const showIncompleteStripe = hasStripeAccount && !stripeSetupComplete;

  return (
    <div className="bg-[#FFF9E6] rounded-xl p-6 relative">
      <button 
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={20} />
      </button>

   
      {showMissingStripe && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            You haven't started setting up your Stripe account. You'll need to do this before your Quilltips Jars are live.
          </AlertDescription>
        </Alert>
      )}

      {showIncompleteStripe && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Your Stripe account setup is incomplete. Please complete setup to begin receiving tips.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {profileId && (
          <>
            <BankAccountConnect
              profileId={profileId}
              stripeAccountId={stripeAccountId}
            />
            <Button 
              onClick={() => navigate('/stripe-help')}
              variant="outline" 
              className="w-full sm:w-auto px-6 py-2 h-auto border-[#2D3748] text-[#2D3748] hover:bg-[#2D3748]/5 font-medium text-base"
            >
              Help with Stripe
            </Button>
          </>
        )}
        
        <Button 
          onClick={() => navigate('/author/settings')}
          variant="outline" 
          className="w-full sm:w-auto px-6 py-2 h-auto border-[#2D3748] text-[#2D3748] hover:bg-[#2D3748]/5 font-medium text-base"
        >
          Edit profile
        </Button>

        <Button 
          onClick={() => navigate('/how-it-works')}
          variant="outline" 
          className="w-full sm:w-auto px-6 py-2 h-auto border-[#2D3748] text-[#2D3748] hover:bg-[#2D3748]/5 font-medium text-base"
        >
          How do Quilltips Jars work?
        </Button>
      </div>
    </div>
  );
};
