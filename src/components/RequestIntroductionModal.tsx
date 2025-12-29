import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  MessageSquare,
  Phone,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Wallet,
  BedDouble,
  Clock,
  User,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useBuyerAssignmentStatus, useAssignBuyer } from '@/hooks/useBuyerAssignments';

// Define local Buyer type
interface Buyer {
  id: string;
  name: string;
  location: string;
  budget: string;
  bedrooms: string;
  timeline: string;
  score: number;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  preferred_contact_method?: string;
}

interface RequestIntroductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: Buyer | null;
  onSuccess?: () => void;
}

const RequestIntroductionModal: React.FC<RequestIntroductionModalProps> = ({
  isOpen,
  onClose,
  buyer,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const { currentTier, tierConfig, contactsUsed, contactsRemaining, setContactsUsed } = useSubscription();
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user has reached their contact limit
  const hasReachedLimit = () => {
    if (tierConfig.monthlyContacts === 'unlimited') return false;
    return contactsUsed >= tierConfig.monthlyContacts;
  };

  // Profile data from auth context
  const contactName = profile?.full_name || 'Your Name';
  const companyName = 'Your Company';
  const contactEmail = user?.email || 'your.email@example.com';
  const contactPhone = '+44 20 7946 0958';

  // Generate default message template
  const generateTemplate = () => {
    if (!buyer) return '';
    return `Hi ${buyer.name},

I'm ${contactName} from ${companyName}. We have properties in ${buyer.location} that match your requirements.

I'd love to discuss what we have available and arrange a viewing at your convenience.`;
  };

  // Reset state when modal opens with new buyer
  useEffect(() => {
    if (isOpen && buyer) {
      setStatus('idle');
      setErrorMessage('');
      setMessage(generateTemplate());
      
      // Pre-select based on buyer's preferred contact method
      if (buyer.preferred_contact_method === 'whatsapp' && buyer.whatsapp_number) {
        setChannel('whatsapp');
      } else if (buyer.preferred_contact_method === 'email' && buyer.email) {
        setChannel('email');
      } else if (buyer.email) {
        setChannel('email');
      } else if (buyer.whatsapp_number) {
        setChannel('whatsapp');
      }
    }
  }, [isOpen, buyer]);

  // Check if buyer is already assigned to this user
  const { data: existingAssignment } = useBuyerAssignmentStatus(buyer?.id || '');
  const assignBuyer = useAssignBuyer();

  const handleSend = async () => {
    if (!buyer || !user) return;

    // Check contact limit before sending
    if (hasReachedLimit()) {
      setStatus('error');
      setErrorMessage('Monthly contact limit reached. Upgrade your plan to contact more buyers.');
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      let assignmentId = existingAssignment?.id;

      // If no existing assignment, create a self-assignment
      if (!assignmentId) {
        try {
          const newAssignment = await assignBuyer.mutateAsync({
            airtableRecordId: buyer.id,
            userId: user.id,
            notes: 'Self-assigned via introduction request',
          });
          assignmentId = newAssignment.id;
        } catch (assignError) {
          console.error('Error creating assignment:', assignError);
          // Continue without assignment - record contact anyway
        }
      }

      // Record the contact in buyer_contacts table
      if (assignmentId) {
        const { error: contactError } = await supabase
          .from('buyer_contacts')
          .insert({
            user_id: user.id,
            airtable_record_id: buyer.id,
            assignment_id: assignmentId,
            contact_method: channel,
            contacted_at: new Date().toISOString(),
            message_content: message,
          });

        if (contactError) {
          console.error('Error recording contact:', contactError);
          // Continue anyway - don't block the user
        } else {
          // Update local contact count
          setContactsUsed(contactsUsed + 1);
        }
      }

      // Send the introduction
      const { data, error } = await supabase.functions.invoke('send-introduction', {
        body: {
          buyerId: buyer.id,
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          buyerPhone: buyer.phone || buyer.whatsapp_number,
          channel,
          customMessage: message,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to send introduction');
      }

      setStatus('success');
      onSuccess?.();

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error sending introduction:', err);
      setStatus('error');
      setErrorMessage(
        err.message?.includes('FunctionsFetchError')
          ? 'Introduction service not available. Please try again later.'
          : err.message || 'Failed to send introduction'
      );
    } finally {
      setIsSending(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-amber-500 text-white';
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-blue-500 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const canSendEmail = buyer?.email;
  const canSendWhatsApp = buyer?.whatsapp_number || buyer?.phone;
  const displayContactsRemaining = typeof contactsRemaining === 'number' 
    ? contactsRemaining 
    : 'unlimited';

  if (!buyer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Introduction</DialogTitle>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Introduction Sent!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {buyer.name} will receive your details and can contact you directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Buyer Summary */}
            <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                {buyer.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{buyer.name}</h3>
                  <Badge className={cn('text-xs', getScoreColor(buyer.score))}>
                    {buyer.score}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {buyer.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    {buyer.budget}
                  </span>
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3 w-3" />
                    {buyer.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {buyer.timeline}
                  </span>
                </div>
              </div>
            </div>

            {/* Channel Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Send via</Label>
              <RadioGroup
                value={channel}
                onValueChange={(val) => setChannel(val as 'email' | 'whatsapp')}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="email"
                  className={cn(
                    'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                    channel === 'email' ? 'border-primary bg-primary/5' : 'border-border',
                    !canSendEmail && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <RadioGroupItem value="email" id="email" disabled={!canSendEmail} />
                  <Mail className="h-4 w-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Email</span>
                    {!canSendEmail && (
                      <p className="text-xs text-muted-foreground">No email available</p>
                    )}
                  </div>
                </Label>
                <Label
                  htmlFor="whatsapp"
                  className={cn(
                    'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                    channel === 'whatsapp' ? 'border-primary bg-primary/5' : 'border-border',
                    !canSendWhatsApp && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <RadioGroupItem value="whatsapp" id="whatsapp" disabled={!canSendWhatsApp} />
                  <MessageSquare className="h-4 w-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">WhatsApp</span>
                    {!canSendWhatsApp && (
                      <p className="text-xs text-muted-foreground">No phone available</p>
                    )}
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Message Template */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="resize-none"
                placeholder="Enter your message..."
              />
            </div>

            {/* Your Contact Details */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your contact details (will be included)
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground" />
                  {contactName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  {companyName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  {contactEmail}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {contactPhone}
                </span>
              </div>
            </div>

            {/* Warning or Limit Reached */}
            {hasReachedLimit() ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your monthly contact limit. Upgrade your plan to contact more buyers.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  This will use 1 of your {displayContactsRemaining} remaining contacts this month
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {status === 'error' && errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {status !== 'success' && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || (!canSendEmail && !canSendWhatsApp) || hasReachedLimit()}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : hasReachedLimit() ? (
                'Limit Reached'
              ) : (
                'Send Introduction'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestIntroductionModal;
