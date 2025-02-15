
import { AuthorRegistrationFields } from "../AuthorRegistrationFields";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";

interface RegistrationStepDetailsProps {
  isLoading: boolean;
  error: string | null;
  onAvatarSelected: (file: File) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const RegistrationStepDetails = ({
  isLoading,
  error,
  onAvatarSelected,
  onSubmit,
}: RegistrationStepDetailsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Complete your profile</h2>
        <p className="text-muted-foreground">
          Tell readers about yourself
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AuthorRegistrationFields 
        isLoading={isLoading} 
        onAvatarSelected={onAvatarSelected}
      />

      <Button
        type="submit"
        className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Continue"}
      </Button>
    </form>
  );
};
