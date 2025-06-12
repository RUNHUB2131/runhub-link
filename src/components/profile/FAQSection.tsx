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
    question: "How do I set up my brand profile to attract run clubs?",
    answer: "Complete all sections of your profile: upload your logo, add your company description, website, and social media accounts. Turn on 'Open to Pitches' to let clubs know you're actively seeking partnerships. A complete profile with clear branding builds trust and makes clubs more likely to apply to your opportunities."
  },
  {
    question: "How do I create and post sponsorship opportunities?",
    answer: "Go to 'Opportunities' → 'Add New Opportunity'. Fill in the title, activation overview, what you're offering clubs, target launch date, and submission deadline. Be specific about location preferences, club size requirements, and follower count ranges. Clear, detailed opportunities get better quality applications."
  },
  {
    question: "How do I find and browse run clubs on the platform?",
    answer: "Use the 'All Clubs' page to browse all running clubs. Filter by state, member count (under 1K to 20K+), and follower ranges. Click on any club to view their full profile, social media stats, and community details. Use the heart icon to favorite clubs you're interested in."
  },
  {
    question: "How does the application and review process work?",
    answer: "When clubs apply to your opportunities, you'll get instant notifications. Go to 'Opportunities' → select your opportunity → 'View Applications' to review all submissions. You can see each club's profile, member count, social media reach, and any custom pitch they submitted. Accept or reject applications with one click."
  },
  {
    question: "What happens after I accept a run club's application?",
    answer: "When you accept an application, a private chat is automatically created between you and the club. You'll both receive notifications and can start discussing partnership details immediately. The club also gets notified of the acceptance via email and in-app notifications."
  },
  {
    question: "How do I communicate with run clubs?",
    answer: "After accepting applications, use the built-in chat system to communicate with clubs. Access chats via the 'Chat' menu or click the chat button on accepted applications. All messages are private and real-time. You'll get notifications for new messages, and clubs can see when you've read their messages."
  },
  {
    question: "Can I edit or delete opportunities after posting them?",
    answer: "Yes! Go to 'Opportunities' and click on any of your posted opportunities to edit details like the description, deadline, or requirements. You can also delete opportunities if needed. Note that if clubs have already applied, they'll be notified of any changes to ensure transparency."
  },
  {
    question: "How do I track my opportunities and applications?",
    answer: "Your dashboard shows key metrics: total opportunities posted and applications received. View detailed stats for each opportunity in the 'Opportunities' section. Track application counts, view which clubs applied, and monitor acceptance/rejection rates. All activity is tracked in real-time."
  },
  {
    question: "What notifications will I receive and how do I manage them?",
    answer: "You'll get in-app notifications (bell icon) and optional email notifications for: new applications to your opportunities, new chat messages from clubs, and application updates. Manage email preferences in Profile → Settings → Permissions. All notifications appear in your dashboard's recent activity."
  },
  {
    question: "How do I manage multiple opportunities and applications efficiently?",
    answer: "Each opportunity has its own applications page where you can bulk review, accept, or reject applications. Use the notifications system to stay on top of new activity. The favorites system helps you track interesting clubs across opportunities. Your dashboard provides an overview of all activity across your account."
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