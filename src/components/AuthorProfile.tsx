import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

interface AuthorProfileProps {
  name: string;
  bio: string;
  imageUrl: string;
  socialLink?: string;
}

export const AuthorProfile = ({ name, bio, imageUrl, socialLink }: AuthorProfileProps) => {
  return (
    <Card className="glass-card p-6 max-w-2xl mx-auto animate-enter">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-32 h-32 mx-auto md:mx-0 rounded-full overflow-hidden border-2 border-border">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="text-muted-foreground mt-2">{bio}</p>
          </div>
          
          {socialLink && (
            <a
              href={socialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" className="hover-lift">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};