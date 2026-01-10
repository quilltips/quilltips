
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQRCodeDetailsPage } from "@/hooks/use-qr-code-details-page";
import { AuthorQRCodeDetailsSection } from "@/components/qr/AuthorQRCodeDetailsSection";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const AuthorQRCodeDetails = () => {
  const { qrCode, qrLoading, qrCodeRef } = useQRCodeDetailsPage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verify ownership after QR code loads
  useEffect(() => {
    if (!qrLoading && qrCode && user) {
      if (qrCode.author_id !== user.id) {
        toast({
          title: "Access Denied",
          description: "You can only view your own QR codes.",
          variant: "destructive",
        });
        navigate('/author/dashboard', { replace: true });
      }
    }
  }, [qrCode, qrLoading, user, navigate, toast]);

  if (qrLoading) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-2xl font-bold text-red-500">QR Code not found</h1>
      </div>
    );
  }

  // Don't render if user doesn't own this QR code
  if (user && qrCode.author_id !== user.id) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link 
          to="/author/dashboard" 
          className="inline-flex items-center hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <AuthorQRCodeDetailsSection 
          qrCode={qrCode} 
          qrCodeRef={qrCodeRef}
        />
      </div>
    </div>
  );
};

export default AuthorQRCodeDetails;
