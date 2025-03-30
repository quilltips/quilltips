
import { useQRCodeFetch } from "./use-qr-code-fetch";
import { useTipSubmission } from "./use-tip-submission";
import { useState } from "react";

export const useQRCodeDetails = () => {
  const {
    id,
    qrCode,
    qrCodeLoading,
    showPublisherInvite,
    setShowPublisherInvite
  } = useQRCodeFetch();

  const {
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
  } = useTipSubmission(qrCode);

  const [showTipForm, setShowTipForm] = useState(false);

  return {
    id,
    qrCode,
    qrCodeLoading,
    showPublisherInvite,
    setShowPublisherInvite,
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
    showTipForm,
    setShowTipForm,
    authorFirstName
  };
};
