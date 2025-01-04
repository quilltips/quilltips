import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AuthorRegistrationFieldsProps {
  isLoading: boolean;
}

export const AuthorRegistrationFields = ({ isLoading }: AuthorRegistrationFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name as it appears on your books"
          required
          className="hover-lift"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          className="hover-lift"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a secure password"
          required
          minLength={8}
          className="hover-lift"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Short Bio</Label>
        <Input
          id="bio"
          name="bio"
          placeholder="Tell readers a bit about yourself"
          required
          className="hover-lift"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};