
import { Card } from "./ui/card";
import { LoginForm } from "./auth/LoginForm";
import { PasswordResetForm } from "./auth/PasswordResetForm";
import { useAuthorLogin } from "@/hooks/use-author-login";

export const AuthorLoginForm = () => {
  const {
    isLoading,
    isResetting,
    resetEmail,
    setResetEmail,
    error,
    showResetForm,
    setShowResetForm,
    handleLogin,
    handleResetPassword
  } = useAuthorLogin();

  return (
    <Card className="auth-card max-w-md mx-auto animate-enter">
      {!showResetForm ? (
        <LoginForm
          isLoading={isLoading}
          error={error}
          onSubmit={handleLogin}
          onResetClick={() => setShowResetForm(true)}
        />
      ) : (
        <PasswordResetForm
          email={resetEmail}
          setEmail={setResetEmail}
          isLoading={isResetting}
          error={error}
          onSubmit={handleResetPassword}
          onBack={() => setShowResetForm(false)}
        />
      )}
    </Card>
  );
};
