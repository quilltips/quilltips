
import { AuthorRegistrationFields } from "../AuthorRegistrationFields";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";

interface RegistrationStepDetailsProps {
  isLoading: boolean;
  error: string | null;
  onAvatarSelected: (file: File | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  initialName?: string;
  initialBio?: string;
  initialSocialLinks?: { url: string; label: string }[];
  initialAvatarPreview?: string;
}

export const RegistrationStepDetails = ({
  isLoading,
  error,
  onAvatarSelected,
  onSubmit,
  initialName,
  initialBio,
  initialSocialLinks,
  initialAvatarPreview,
}: RegistrationStepDetailsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-center text-[#2D3748]">Make your profile</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AuthorRegistrationFields 
        isLoading={isLoading} 
        onAvatarSelected={onAvatarSelected}
        initialName={initialName}
        initialBio={initialBio}
        initialSocialLinks={initialSocialLinks}
        initialAvatarPreview={initialAvatarPreview}
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
