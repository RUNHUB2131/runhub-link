import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface FAQSectionProps {
  onBack: () => void;
  onContactSupport: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const runClubFAQs: FAQItem[] = [
  {
    question: "How do I complete my run club profile?",
    answer: "To complete your profile, go to the 'Basic Information' section and fill in your club name, description, website, and location. Then add your social media accounts in the 'Social Media' section and provide community details like member count and run types in the 'Community Information' section. A complete profile helps brands find and connect with your club."
  },
  {
    question: "What types of sponsorship opportunities are available?",
    answer: "Brands post various sponsorship opportunities including product sponsorships, event partnerships, race sponsorships, gear collaborations, and promotional partnerships. Each opportunity lists specific requirements like member count, location, and social media following ranges."
  },
  {
    question: "How do I apply for sponsorship opportunities?",
    answer: "Browse available opportunities on your dashboard, review the requirements to ensure your club is a good fit, then click 'Apply' and provide any additional information requested. Make sure your profile is complete before applying as brands review your full club information."
  },
  {
    question: "What happens after I submit an application?",
    answer: "After submitting an application, the brand will review it and either accept or decline. You'll receive a notification about the status. If accepted, a chat will be automatically created so you can communicate directly with the brand about next steps."
  },
  {
    question: "Can I chat with brands before applying?",
    answer: "Direct chat is only available after your application is accepted. However, brands can contact you directly through the platform if they're interested in your club. You can also make your club more discoverable by keeping your profile complete and active."
  },
  {
    question: "How do I track my application status?",
    answer: "You can view all your applications and their status (pending, accepted, or declined) in the 'Applications' section of your dashboard. You'll also receive notifications when there are updates to your applications."
  },
  {
    question: "What social media information should I include?",
    answer: "Include your Instagram, TikTok, Facebook, and Strava handles along with your follower count range. This helps brands understand your club's reach and engagement. Make sure to keep this information updated as your following grows."
  },
  {
    question: "How many members should I list for my club?",
    answer: "Be honest about your current active member count. This includes regular participants in your runs and events. Brands use this information to match opportunities with the right club size, so accuracy helps ensure better partnerships."
  },
  {
    question: "Can I edit my profile after creating it?",
    answer: "Yes! You can edit all sections of your profile at any time by clicking the edit button in each section. It's recommended to keep your information current, especially member counts and social media following."
  },
  {
    question: "Is there a cost to use RunHub Link?",
    answer: "No, RunHub Link is completely free for run clubs. You can create your profile, apply for sponsorships, and communicate with brands at no cost. Our platform is designed to help running communities connect with supportive brands."
  }
];

const brandFAQs: FAQItem[] = [
  {
    question: "How do I create effective sponsorship opportunities?",
    answer: "Create clear, specific opportunities by defining your goals, target club size, geographic preferences, and what you're offering. Include details about deliverables, timeline, and application requirements. The more specific you are, the better quality applications you'll receive."
  },
  {
    question: "How can I find the right run clubs to partner with?",
    answer: "Use the 'All Clubs' section to browse and filter clubs by location, member count, and social media following. You can favorite clubs that interest you and contact them directly. Review their profiles, social media presence, and community engagement to find the best fit."
  },
  {
    question: "What information should I include in my brand profile?",
    answer: "Complete your company information, website, description, and social media accounts. Upload your logo and clearly describe your brand values and what you offer to running communities. A complete profile builds trust with run clubs."
  },
  {
    question: "How do I review and manage applications?",
    answer: "Go to your 'Applications' dashboard to review all applications for your opportunities. You can accept or decline applications, and chat will automatically be enabled with accepted clubs. Review club profiles thoroughly before making decisions."
  },
  {
    question: "Can I contact run clubs directly without posting an opportunity?",
    answer: "Yes! You can browse all clubs and contact them directly through their profiles. This is great for building relationships or proposing custom partnerships that don't fit into a standard opportunity format."
  },
  {
    question: "What types of partnerships work best with run clubs?",
    answer: "Successful partnerships include product sampling, gear sponsorships, event partnerships, race sponsorships, and social media collaborations. Focus on providing value to the running community rather than just promotional opportunities."
  },
  {
    question: "How should I structure sponsorship offers?",
    answer: "Consider offering a mix of products, services, or financial support along with clear expectations for deliverables. Popular options include gear for club members, race entry sponsorships, event space, or promotional products for giveaways."
  },
  {
    question: "What club size should I target for partnerships?",
    answer: "This depends on your goals and budget. Smaller clubs (under 1,000 members) often provide more engaged, tight-knit communities. Larger clubs offer broader reach. Many brands find success with clubs in the 1,000-4,000 member range for balanced engagement and reach."
  },
  {
    question: "How do I track the success of my partnerships?",
    answer: "Work with clubs to establish clear metrics like social media posts, event participation, or member engagement. Many successful partnerships include photo sharing, social media mentions, and feedback from club members about your products or services."
  },
  {
    question: "Is there a cost to use RunHub Link for brands?",
    answer: "Basic features like creating your profile and posting opportunities are free. Some premium features like enhanced club discovery and analytics may have associated costs. Contact support for information about premium features and pricing."
  }
];

export const FAQSection = ({ onBack, onContactSupport }: FAQSectionProps) => {
  const { userType } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const faqs = userType === 'brand' ? brandFAQs : runClubFAQs;
  const title = userType === 'brand' ? 'Brand FAQs' : 'Run Club FAQs';

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {/* Introduction */}
      <Card className="p-6">
        <p className="text-muted-foreground">
          {userType === 'brand' 
            ? "Find answers to common questions about using RunHub Link to connect with running communities and manage sponsorship opportunities."
            : "Find answers to common questions about using RunHub Link to find sponsorship opportunities and connect with brands."
          }
        </p>
      </Card>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="overflow-hidden">
            <Button
              variant="ghost"
              className="w-full p-6 h-auto text-left justify-between rounded-none"
              onClick={() => toggleExpanded(index)}
            >
              <span className="font-medium text-base pr-4">{faq.question}</span>
              {expandedItems.has(index) ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </Button>
            
            {expandedItems.has(index) && (
              <div className="px-6 pb-6 pt-0">
                <div className="border-t pt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Can't find what you're looking for?
        </p>
        <Button variant="outline" onClick={onContactSupport}>
          Contact Support
        </Button>
      </Card>
    </div>
  );
}; 