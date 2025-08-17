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
  arc: "Join the ARC program to get early access to upcoming releases and help shape the final version.",
  beta: "Become a beta reader to provide feedback on works in progress and get exclusive early access.",
  newsletter: "Subscribe to the newsletter for updates, exclusive content, and release announcements."
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
    case 'arc': return "Join ARC Program";
    case 'beta': return "Become Beta Reader";
    case 'newsletter': return "Subscribe to Newsletter";
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
      description: arcDescription || defaultDescriptions.arc,
      component: <ARCSignupCard authorId={authorId} description={arcDescription || defaultDescriptions.arc} />
    },
    {
      key: 'beta',
      enabled: betaEnabled,
      description: betaDescription || defaultDescriptions.beta,
      component: <BetaReaderSignupCard authorId={authorId} description={betaDescription || defaultDescriptions.beta} />
    },
    {
      key: 'newsletter',
      enabled: newsletterEnabled,
      description: newsletterDescription || defaultDescriptions.newsletter,
      component: <NewsletterSignupCard authorId={authorId} description={newsletterDescription || defaultDescriptions.newsletter} />
    }
  ].filter(option => option.enabled);

  if (signupOptions.length === 0) {
    return null;
  }

  return (
    <Card className="border border-primary/20 rounded-lg overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Reader Opportunities</h3>
        {signupOptions.map((option) => (
          <Collapsible 
            key={option.key}
            open={openSections[option.key]} 
            onOpenChange={() => toggleSection(option.key)}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-3">
                  {getIcon(option.key)}
                  <div className="text-left">
                    <div className="font-medium">{getButtonText(option.key)}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {option.description}
                    </div>
                  </div>
                </div>
                {openSections[option.key] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              {option.component}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};