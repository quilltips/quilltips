
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useTipSubmission = (qrCode: any) => {
  const [amount, setAmount] = useState("5");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extract author's first name
  const authorFirstName = qrCode?.author?.name?.split(' ')[0] || 'the author';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const finalAmount = amount === 'custom' ? customAmount : amount;

    try {
      if (!qrCode) throw new Error('QR code not found');
      if (!email) throw new Error('Email is required');
      if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      console.log('Creating tip checkout for:', { 
        amount: finalAmount, 
        authorId: qrCode.author_id,
        qrCodeId: qrCode.id 
      });
      
      const { data, error } = await supabase.functions.invoke('create-tip-checkout', {
        body: {
          amount: Number(finalAmount),
          authorId: qrCode.author_id,
          message,
          name,
          email,
          bookTitle: qrCode.book_title,
          qrCodeId: qrCode.id,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.code === 'ACCOUNT_SETUP_INCOMPLETE') {
          toast({
            title: "Account Setup Required",
            description: "The author needs to complete their payment account setup before they can receive tips.",
            variant: "destructive",
          });
          navigate(`/profile/${qrCode.author_id}`);
          return;
        }
        throw new Error(data.error);
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    amount,
    setAmount,
    customAmount,
    setCustomAmount,
    message,
    setMessage,
    name,
    setName,
    email,
    setEmail,
    isLoading,
    handleSubmit,
    authorFirstName
  };
};
