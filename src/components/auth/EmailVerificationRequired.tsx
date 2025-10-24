import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const EmailVerificationRequired = () => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <CardTitle>Email Verification Required</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          To create QR codes and receive tips, please verify your email address first.
        </p>
        <Button 
          onClick={() => navigate('/author/verify-email')}
          className="w-full"
        >
          Verify Email Now
        </Button>
      </CardContent>
    </Card>
  );
};
