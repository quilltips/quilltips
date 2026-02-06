import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, BookOpen, Users, Mail } from "lucide-react";
import { ARCSignupCard } from "./ARCSignupCard";
import { BetaReaderSignupCard } from "./BetaReaderSignupCard";
import { NewsletterSignupCard } from "./NewsletterSignupCard";

interface CollapsibleSignupSectionProps {
  authorId: string;
  arcEnabled: boolean;
  arcDescription: string | null;
  betaEnabled: boolean;
  betaDescription: string | null;
  newsletterEnabled: boolean;
  newsletterDescription: string | null;
}

const defaultDescriptions = {
  arc: "Join the advanced reader copy program to get early access to upcoming releases in exchange for feedback.",
  beta: "Become a beta reader to provide feedback on works in progress and to help shape the final version.",
  newsletter: "Subscribe to author updates and release announcements!"
};

const getIcon = (type: string) => {
  switch (type) {
    case 'arc': return <BookOpen className="h-4 w-4" />;
    case 'beta': return <Users className="h-4 w-4" />;
    case 'newsletter': return <Mail className="h-4 w-4" />;
    default: return null;
  }
};

const getButtonText = (type: string) => {
  switch (type) {
    case 'arc': return "Sign up for ARC reader access";
    case 'beta': return "Sign up for Beta reader access";
    case 'newsletter': return "Sign up for Author updates";
    default: return "";
  }
};

export const CollapsibleSignupSection = ({
  authorId,
  arcEnabled,
  arcDescription,
  betaEnabled,
  betaDescription,
  newsletterEnabled,
  newsletterDescription
}: CollapsibleSignupSectionProps) => {
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const signupOptions = [
    {
      key: 'arc',
      enabled: arcEnabled,
      component: <ARCSignupCard authorId={authorId} description={arcDescription || defaultDescriptions.arc} />
    },
    {
      key: 'beta',
      enabled: betaEnabled,
      component: <BetaReaderSignupCard authorId={authorId} description={betaDescription || defaultDescriptions.beta} />
    },
    {
      key: 'newsletter',
      enabled: newsletterEnabled,
      component: <NewsletterSignupCard authorId={authorId} description={newsletterDescription || defaultDescriptions.newsletter} />
    }
  ].filter(option => option.enabled);

  if (signupOptions.length === 0) {
    return null;
  }

  return (
    <Card className="border border-[#333333]/50 rounded-lg overflow-hidden">
      <CardContent className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-foreground mb-3">Connect with the Author</h3>
        {signupOptions.map((option) => (
          <Collapsible 
            key={option.key}
            open={openSections[option.key]} 
            onOpenChange={() => toggleSection(option.key)}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-between p-3 h-auto border border-none hover:bg-transparent hover:shadow-none hover:underline"
              >
                <div className="flex items-center gap-2">
                  {getIcon(option.key)}
                  <div className="text-left">
                    <div className="font-medium text-sm">{getButtonText(option.key)}</div>
                  </div>
                </div>
                {openSections[option.key] ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              {option.component}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};