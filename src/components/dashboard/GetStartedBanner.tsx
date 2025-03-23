
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface GetStartedBannerProps {
  onClose: () => void;
  hasStripeAccount: boolean;
}

export const GetStartedBanner = ({ onClose, hasStripeAccount }: GetStartedBannerProps) => {
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
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate('/author/bank-account')}
          className="w-full sm:w-auto px-6 py-2 h-auto bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] font-medium text-base"
        >
          Link a bank account
        </Button>
        
        <Button 
          onClick={() => navigate('/author/settings')}
          variant="outline" 
          className="w-full sm:w-auto px-6 py-2 h-auto border-[#2D3748] text-[#2D3748] hover:bg-[#2D3748]/5 font-medium text-base"
        >
          Edit profile
        </Button>
      </div>
    </div>
  );
};
