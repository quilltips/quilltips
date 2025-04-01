
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQRCodeDetailsPage } from "@/hooks/use-qr-code-details-page";
import { AuthorQRCodeDetailsSection } from "@/components/qr/AuthorQRCodeDetailsSection";
import { AuthorQRCodeTipHistorySection } from "@/components/qr/AuthorQRCodeTipHistorySection";

const AuthorQRCodeDetails = () => {
  const { qrCode, qrLoading, tipData, qrCodeRef } = useQRCodeDetailsPage();

  if (qrLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!qrCode) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24">
          <h1 className="text-2xl font-bold text-red-500">QR Code not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link 
            to="/author/dashboard" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          <AuthorQRCodeDetailsSection 
            qrCode={qrCode} 
            qrCodeRef={qrCodeRef}
          />

          <AuthorQRCodeTipHistorySection 
            tipData={tipData}
            authorId={qrCode.author_id}
            qrCodeId={qrCode.id}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AuthorQRCodeDetails;
