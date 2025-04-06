
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TipSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get parameters from URL
  const authorId = searchParams.get("authorId");
  const amount = searchParams.get("amount");
  
  useEffect(() => {
    const fetchAuthorDetails = async () => {
      if (!authorId) return;
      
      try {
        const { data, error } = await supabase.rpc(
          'get_public_profile_by_id',
          { profile_id: authorId }
        );
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setAuthorName(data[0].name || 'the author');
        }
      } catch (error) {
        console.error("Error fetching author details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuthorDetails();
  }, [authorId]);
  
  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Thank you for your tip!
          </h1>
          
          <p className="text-lg mb-8 text-gray-600">
            {isLoading ? (
              "Your tip has been sent successfully."
            ) : (
              <>
                Your tip of ${amount || "5"} has been sent to {authorName || "the author"}.
                {" "}Thank you for supporting their work!
              </>
            )}
          </p>
          
          {authorId && (
            <Button 
              asChild 
              className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white px-8 py-6 h-auto text-lg font-medium rounded-full"
            >
              <Link to={`/profile/${authorId}`}>
                Go to Author Profile
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TipSuccessPage;
