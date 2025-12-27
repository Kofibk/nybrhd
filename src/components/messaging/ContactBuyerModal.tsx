// DEPRECATED: This component is being replaced by RequestIntroductionModal.
// The new system uses a simpler "Request Introduction" flow instead of full chat.
// Will be removed once the new system is fully tested.

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Mail, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Buyer } from '@/lib/buyerData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ContactBuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: Buyer | null;
  userType: 'developer' | 'agent' | 'broker';
}

const defaultTemplates = [
  {
    name: 'Introduction',
    content: `Hi [Buyer Name],

I noticed you're looking for a property in [Location] and I believe I can help you find the perfect home.

I have access to some exclusive developments that match your criteria. Would you be interested in learning more?

Best regards`
  },
  {
    name: 'New Development',
    content: `Hi [Buyer Name],

We have just launched a new development that I think would be perfect for you based on your requirements.

The properties are within your budget and in a location you expressed interest in. I'd love to share more details with you.

When would be a good time to chat?`
  },
  {
    name: 'Viewing Invitation',
    content: `Hi [Buyer Name],

I wanted to reach out because I have some beautiful properties available for viewings this week.

Based on your preferences, I think you'd really love what we have to offer. Would you be available for a private viewing?

Let me know what works best for you!`
  }
];

const ContactBuyerModal = ({ isOpen, onClose, buyer, userType }: ContactBuyerModalProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [contactsUsed, setContactsUsed] = useState(0);
  const [buyerContactCount, setBuyerContactCount] = useState(0);
  const [alreadyContacted, setAlreadyContacted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { startConversation, getContactsUsedThisMonth, getContactLimit, getBuyerContactCount, hasContactedBuyer } = useMessaging();
  const { currentTier } = useSubscription();
  const navigate = useNavigate();

  const contactLimit = getContactLimit();
  const isAtLimit = contactsUsed >= contactLimit && currentTier !== 'enterprise';
  const buyerFullyContacted = buyerContactCount >= 4 && !alreadyContacted;

  useEffect(() => {
    if (isOpen && buyer) {
      setMessage('');
      setError(null);
      
      // Fetch contact stats
      getContactsUsedThisMonth().then(setContactsUsed);
      getBuyerContactCount(buyer.id).then(setBuyerContactCount);
      hasContactedBuyer(buyer.id).then(setAlreadyContacted);
    }
  }, [isOpen, buyer, getContactsUsedThisMonth, getBuyerContactCount, hasContactedBuyer]);

  const handleTemplateSelect = (templateName: string) => {
    const template = defaultTemplates.find(t => t.name === templateName);
    if (template && buyer) {
      const filledContent = template.content
        .replace('[Buyer Name]', buyer.name.split(' ')[0])
        .replace('[Location]', buyer.location);
      setMessage(filledContent);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !buyer) return;

    setSending(true);
    setError(null);

    const result = await startConversation(buyer.id, message);

    setSending(false);

    if (result.success && result.conversationId) {
      toast.success(`Message sent to ${buyer.name}`);
      onClose();
      navigate(`/${userType}/chat/${result.conversationId}`);
    } else {
      setError(result.error || 'Failed to send message');
    }
  };

  if (!buyer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact {buyer.name}</DialogTitle>
          <DialogDescription>
            Send a message to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Buyer Summary */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-semibold text-primary">
              {buyer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="font-medium">{buyer.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {buyer.location}
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              Score: {buyer.score}
            </Badge>
          </div>

          {/* Contact Limit Warning */}
          {isAtLimit && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-destructive">Contact limit reached</div>
                <p className="text-sm text-muted-foreground">
                  You've used all {contactLimit} contacts this month. Upgrade to send more messages.
                </p>
                <Button size="sm" className="mt-2" onClick={() => navigate(`/${userType}/settings`)}>
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}

          {/* Buyer Fully Contacted Warning */}
          {buyerFullyContacted && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-amber-600">Buyer fully contacted</div>
                <p className="text-sm text-muted-foreground">
                  This buyer has already been contacted by 4 users.
                </p>
              </div>
            </div>
          )}

          {/* Template Selector */}
          {!isAtLimit && !buyerFullyContacted && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Use a template</label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultTemplates.map(template => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi, I noticed you're looking for a property in ${buyer.location}...`}
                  rows={6}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {message.length} characters
                </div>
              </div>

              {/* Delivery Info */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="text-sm font-medium">Your message will be delivered via:</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Email</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span>WhatsApp</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {buyer.name.split(' ')[0]} will be notified on both channels and can reply via either. 
                  You'll see their response here in the platform.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!isAtLimit && !buyerFullyContacted && (
              <Button 
                onClick={handleSend} 
                disabled={!message.trim() || sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactBuyerModal;
