
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

interface TipMessageFormProps {
  name: string;
  message: string;
  email: string;
  isPrivate?: boolean;
  authorFirstName?: string;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPrivateChange?: (value: boolean) => void;
}

export const TipMessageForm = ({
  name,
  message,
  email,
  isPrivate = false,
  authorFirstName = "the author",
  onNameChange,
  onMessageChange,
  onEmailChange,
  onPrivateChange,
}: TipMessageFormProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-lg font-medium text-[#1A2B3B]">Name (optional)</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg font-medium text-[#1A2B3B]">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-lg font-medium text-[#1A2B3B]">Message (optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={``}
          className="w-full px-4 py-3 rounded-lg border border-[#333333] focus:ring-2 focus:ring-primary resize-none"
          rows={3}
        />
      </div>

      {onPrivateChange && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="private"
            checked={isPrivate}
            onCheckedChange={onPrivateChange}
          />
          <Label 
            htmlFor="private" 
            className="text-sm font-normal cursor-pointer"
          >
            Keep this message private (only visible to you and the author)
          </Label>
        </div>
      )}
    </div>
  );
};
