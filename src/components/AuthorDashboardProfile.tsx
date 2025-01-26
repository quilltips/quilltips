import { Button } from "./ui/button";
import { ExternalLink, User, Globe, Twitter, Instagram, Linkedin, Github } from "lucide-react";

interface SocialLink {
  url: string;
  label: string;
}

interface AuthorDashboardProfileProps {
  name: string;
  bio: string;
  imageUrl: string;
  socialLinks?: SocialLink[];
  publicProfileLink?: string;
}

const getSocialIcon = (label: string) => {
  const label_lower = label.toLowerCase();
  if (label_lower.includes('twitter')) return Twitter;
  if (label_lower.includes('instagram')) return Instagram;
  if (label_lower.includes('linkedin')) return Linkedin;
  if (label_lower.includes('github')) return Github;
  return Globe;
};

export const AuthorDashboardProfile = ({ 
  name, 
  bio, 
  imageUrl, 
  socialLinks = [],
  publicProfileLink 
}: AuthorDashboardProfileProps) => {
  return (
    <div className="max-w-2xl mx-auto animate-enter bg-[#FEF7CD]/30 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FEC6A1] shadow-lg">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-[#2D3748]">{name}</h2>
          <p className="text-[#4A5568] max-w-lg mx-auto leading-relaxed">{bio}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 w-full">
          {publicProfileLink && (
            <a
              href={publicProfileLink}
              className="inline-block"
            >
              <Button 
                variant="outline" 
                className="hover-lift bg-white border-[#FEC6A1] hover:bg-[#FEC6A1]/10 text-[#2D3748]"
              >
                <User className="h-4 w-4 mr-2" />
                Public Profile
              </Button>
            </a>
          )}
          
          {socialLinks.map((link, index) => {
            const IconComponent = getSocialIcon(link.label);
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  variant="outline" 
                  className="hover-lift bg-white border-[#FEC6A1] hover:bg-[#FEC6A1]/10 text-[#2D3748]"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};