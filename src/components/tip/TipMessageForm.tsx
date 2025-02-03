import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface TipMessageFormProps {
  name: string;
  message: string;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
}

export const TipMessageForm = ({
  name,
  message,
  onNameChange,
  onMessageChange,
}: TipMessageFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-2xl font-semibold text-[#1A2B3B]">Your Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Name or @yoursocial (optional)"
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-2xl font-semibold text-[#1A2B3B]">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Say something nice... (optional)"
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary resize-none"
          rows={3}
        />
      </div>
    </>
  );
};