
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

interface TipMessageFormProps {
  name: string;
  message: string;
  email: string;
  isPrivate?: boolean;
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
  onNameChange,
  onMessageChange,
  onEmailChange,
  onPrivateChange
}: TipMessageFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormLabel htmlFor="name">Your Name (Optional)</FormLabel>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <FormLabel htmlFor="email" className="flex items-center gap-1">
          Email
          <span className="text-red-500 text-xs">*</span>
        </FormLabel>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Required for receipt. Won't be shared with the author.
        </p>
      </div>
      
      <div className="space-y-2">
        <FormLabel htmlFor="message">Leave a message (Optional)</FormLabel>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
        />
      </div>
      
      {onPrivateChange && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="privacy" 
            checked={isPrivate}
            onCheckedChange={(checked) => onPrivateChange(checked === true)}
          />
          <label 
            htmlFor="privacy"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Keep this tip private (only visible to the author)
          </label>
        </div>
      )}
    </div>
  );
};
