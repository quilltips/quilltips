
import { useState } from "react";
import { Card } from "./ui/card";
import { LoginForm } from "./auth/LoginForm";
import { PasswordResetForm } from "./auth/PasswordResetForm";

export const AuthorLoginForm = () => {
  const [showResetForm, setShowResetForm] = useState(false);

  return (
    <Card className="auth-card max-w-md mx-auto animate-enter">
      {!showResetForm ? (
        <LoginForm onResetPassword={() => setShowResetForm(true)} />
      ) : (
        <PasswordResetForm onBackToLogin={() => setShowResetForm(false)} />
      )}
    </Card>
  );
};
