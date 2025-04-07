
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface TipMessageFormProps {
  name: string;
  message: string;
  email: string;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export const TipMessageForm = ({
  name,
  message,
  email,
  onNameChange,
  onMessageChange,
  onEmailChange,
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
          placeholder="Your name"
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
          placeholder="Your email address"
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
          placeholder="Leave a message for the author"
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary resize-none"
          rows={3}
        />
      </div>
    </div>
  );
};
