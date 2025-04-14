
import { X, HelpCircle, AlertTriangle } from "lucide-react";
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

  return (
    <div className="bg-[#FFF9E6] rounded-xl p-6 relative">
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#2D3748] mb-1">Get started</h2>
      </div>
      
      {hasStripeAccount && !stripeSetupComplete && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Your Stripe account setup is incomplete. Please complete your account setup to receive payments.
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
