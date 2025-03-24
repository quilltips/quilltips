
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
    <div className="space-y-2">
      <Label>Social Links</Label>
      {socialLinks.map((link, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Label (e.g., Website, Twitter)"
              value={link.label}
              onChange={(e) => updateSocialLink(index, "label", e.target.value)}
              className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
            />
            <Input
              placeholder="URL (e.g., https://your-website.com)"
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addSocialLink}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Social Link
      </Button>
    </div>
  );
};
