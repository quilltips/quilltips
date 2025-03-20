
import { Button } from "./ui/button";
import { ExternalLink, Globe, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
  return <div className="max-w-2xl mx-auto animate-enter bg-[#FEF7CD]/30 p-8 shadow-sm rounded-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FEC6A1] shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FEC6A1] focus:ring-offset-2">
              <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <div className="aspect-square w-full overflow-hidden rounded-lg">
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-[#2D3748]">{name}</h2>
          <p className="text-[#4A5568] max-w-lg mx-auto leading-relaxed">{bio}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 w-full">
          {socialLinks.map((link, index) => {
          const IconComponent = getSocialIcon(link.label);
          return <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Button variant="outline" size="sm" className="hover-lift bg-white border-[#FEC6A1] hover:bg-[#FEC6A1]/10 text-[#2D3748] text-xs">
                  <IconComponent className="h-3 w-3 mr-1.5" />
                  {link.label}
                </Button>
              </a>;
        })}
        </div>
      </div>
    </div>;
};
