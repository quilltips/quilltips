
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TipSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [readerName, setReaderName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get parameters from URL
  const authorId = searchParams.get("authorId");
  const readerEmail = searchParams.get("email");
  const amount = searchParams.get("amount");
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!authorId || !readerEmail) return;
      
      try {
        // Fetch author details
        const { data: authorData, error: authorError } = await supabase.rpc(
          'get_public_profile_by_id',
          { profile_id: authorId }
        );
        
        // Fetch reader name from email
        const { data: readerData, error: readerError } = await supabase
          .from('profiles')
          .select('name')
          .eq('email', readerEmail)
          .single();
        
        if (authorError) throw authorError;
        
        if (authorData && authorData.length > 0) {
          setAuthorName(authorData[0].name || 'the author');
        }
        
        if (readerData) {
          setReaderName(readerData.name?.split(' ')[0] || 'Reader');
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [authorId, readerEmail]);
  
  return (
    
      <div className="container max-w-2xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-[#FFD166]/10 p-3">
              <CheckCircle className="h-12 w-12 text-[#FFD166]" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Thank you for your tip{readerName ? `, ${readerName}` : ''}!
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
              className="bg-[#19363C] hover:bg-[#19363C]/90 text-white px-8 py-6 h-auto text-lg font-medium rounded-full"
            >
              <Link to={`/profile/${authorId}`}>
                Return to Author Profile
              </Link>
            </Button>
          )}
        </div>
      </div>
  
  );
};

export default TipSuccessPage;
