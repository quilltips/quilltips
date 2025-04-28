import { useState } from "react";
import { AvatarUpload } from "./profile/AvatarUpload";
import { ProfileForm } from "./profile/ProfileForm";
import { BankAccountConnect } from "./profile/BankAccountConnect";
import { AccountCredentials } from "./profile/AccountCredentials";
import { EmailTestButton } from "./profile/EmailTestButton";

interface SocialLink {
  url: string;
  label: string;
}

interface ProfileSettingsProps {
  profile: {
    id: string;
    name?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    stripe_account_id?: string | null;
    social_links?: SocialLink[] | null;
  };
  onChangeStatus?: (hasChanges: boolean) => void;
}

export const ProfileSettings = ({ profile, onChangeStatus }: ProfileSettingsProps) => {
  const [hasFormChanges, setHasFormChanges] = useState(false);

  const handleFormChangesStatus = (hasChanges: boolean) => {
    setHasFormChanges(hasChanges);
    if (onChangeStatus) {
      onChangeStatus(hasChanges);
    }
  };

  return (
    <div className="space-y-8">
      <AvatarUpload
        profileId={profile.id}
        avatarUrl={profile.avatar_url ?? null}
        name={profile.name ?? ""}
      />

      <ProfileForm
        profileId={profile.id}
        initialName={profile.name ?? ""}
        initialBio={profile.bio ?? ""}
        initialSocialLinks={profile.social_links ?? []}
        onChangeStatus={handleFormChangesStatus}
      />

      <AccountCredentials />

      <div className="mt-8 space-y-6">
        <BankAccountConnect
          profileId={profile.id}
          stripeAccountId={profile.stripe_account_id ?? null}
        />

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-medium mb-4">Troubleshooting</h3>
          <EmailTestButton profileId={profile.id} />
        </div>
      </div>
    </div>
  );
};
