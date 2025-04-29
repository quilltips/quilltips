
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

      try {
        // Verify token is valid
        const { data: tokenData, error: tokenError } = await supabase
          .from("unsubscribe_tokens")
          .select("*")
          .eq("token", token)
          .eq("tip_id", tipId)
          .single();

        if (tokenError || !tokenData) {
          throw new Error("Invalid or expired unsubscribe token");
        }

        // Check token expiration
        if (new Date(tokenData.expires_at) < new Date()) {
          throw new Error("Unsubscribe link has expired");
        }

        // Update tip record to mark as unsubscribed
        const { error: updateError } = await supabase
          .from("tips")
          .update({ unsubscribed: true })
          .eq("id", tipId);

        if (updateError) {
          throw updateError;
        }

        setSuccess(true);
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
              <p className="text-lg text-gray-600">
                You will no longer receive notifications about this tip.
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
              <p className="text-lg text-gray-600">{error}</p>
            </>
          )}
        </div>
      </div>

  );
};

export default UnsubscribePage;
