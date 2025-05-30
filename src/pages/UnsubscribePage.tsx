
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, XCircle } from "lucide-react";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get token and tip ID from URL parameters
  const token = searchParams.get("token");
  const tipId = searchParams.get("tipId");

  useEffect(() => {
    const processUnsubscribe = async () => {
      if (!token || !tipId) {
        setError("Invalid unsubscribe link. Missing required parameters.");
        setIsLoading(false);
        return;
      }

      console.log("Processing unsubscribe for tip:", tipId, "with token:", token);

      try {
        // Use the new secure unsubscribe function
        const { data, error: rpcError } = await supabase.rpc('unsubscribe_tip', {
          tip_uuid: tipId,
          unsubscribe_token: token
        });

        console.log("Unsubscribe function result:", data, "Error:", rpcError);

        if (rpcError) {
          console.error("RPC Error:", rpcError);
          throw new Error(`Database error: ${rpcError.message}`);
        }

        if (data === true) {
          console.log("Successfully unsubscribed");
          setSuccess(true);
        } else {
          console.log("Unsubscribe failed - invalid or expired token");
          throw new Error("Invalid or expired unsubscribe link");
        }

      } catch (err) {
        console.error("Unsubscribe error:", err);
        setError(err.message || "Failed to process unsubscribe request");
      } finally {
        setIsLoading(false);
      }
    };

    processUnsubscribe();
  }, [token, tipId]);

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner />
              <p className="text-lg mt-4">Processing your unsubscribe request...</p>
            </div>
          ) : success ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-[#FFD166]/10 p-3">
                  <CheckCircle className="h-12 w-12 text-[#FFD166]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4">Successfully Unsubscribed</h1>
              <p className="text-lg text-gray-600 mb-4">
                You will no longer receive notifications about this tip.
              </p>
              <p className="text-sm text-gray-500">
                If you continue to receive emails, please contact us at{" "}
                <a href="mailto:hello@quilltips.co" className="text-[#19363C] underline">
                  hello@quilltips.co
                </a>
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4">Unsubscribe Failed</h1>
              <p className="text-lg text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                If you need help, please contact us at{" "}
                <a href="mailto:hello@quilltips.co" className="text-[#19363C] underline">
                  hello@quilltips.co
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UnsubscribePage;
