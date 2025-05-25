
import { X, AlertCircle } from "lucide-react";
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
    <div className="bg-[#FFF9E6] rounded-2xl p-6 relative">
      <button 
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="text-xl md:text-2xl ">
        <h1 className="font-playfair font-bold">Get started</h1>
      </div>
   
      {showMissingStripe && (
        <div className="mb-7 bg-[#FFF7E5] border-none mt-6 text-sm">
            You haven't started setting up your Stripe account. You'll need to do this before your Quilltips Jars are live.
        </div>
      )}

      {showIncompleteStripe && (
        <Alert className="mb-4 mt-3 border-none text-red-500 bg-[#FFF7E5] ">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="">
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
              variant="default" 
              className="bg-[transparent]  text-[#2D3748] border border-[#333333] hover:bg-[transparent] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]"
            >
              Help with Stripe
            </Button>
          </>
        )}
        
        <Button 
          onClick={() => navigate('/author/settings')}
          variant="default" 
          className="bg-[transparent]  text-[#2D3748] border border-[#333333] hover:bg-[transparent] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]"
        >
          Edit profile
        </Button>

      </div>
    </div>
  );
};
