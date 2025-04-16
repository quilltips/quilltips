
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Trash2 } from "lucide-react";
import { SocialLink } from "@/hooks/use-profile-form";

interface ProfileSocialLinksProps {
  socialLinks: SocialLink[];
  hasChanges: boolean;
  addSocialLink: () => void;
  removeSocialLink: (index: number) => void;
  updateSocialLink: (index: number, field: keyof SocialLink, value: string) => void;
}

export const ProfileSocialLinks = ({
  socialLinks,
  hasChanges,
  addSocialLink,
  removeSocialLink,
  updateSocialLink
}: ProfileSocialLinksProps) => {
  return (
    <div className="space-y-4">
      {socialLinks.map((link, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="Link label (Website, Twitter, Instagram...)"
              value={link.label}
              onChange={(e) => updateSocialLink(index, "label", e.target.value)}
              className={`mb-2 sm:mb-0 ${hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}`}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="URL (https://...)"
              value={link.url}
              onChange={(e) => updateSocialLink(index, "url", e.target.value)}
              className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSocialLink(index)}
            className="h-10 w-10 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="link"
        onClick={addSocialLink}
        className="px-0 text-primary underline underline-offset-4 hover:text-primary/80 font-normal h-auto"
      >
        Add another link
      </Button>
    </div>
  );
};
