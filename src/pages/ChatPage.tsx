import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useParams } from 'react-router-dom';
import { demoConversations, getScoreBreakdown } from '@/lib/buyerData';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  Wallet, 
  BedDouble, 
  Clock, 
  CreditCard,
  Calendar,
  Zap,
  Check,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ChatPageProps {
  userType: 'developer' | 'agent' | 'broker';
}

const ChatPage: React.FC<ChatPageProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { currentTier } = useSubscription();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const basePath = `/${userType}`;

  const conversation = demoConversations.find(c => c.id === conversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  if (!conversation) {
    return (
      <DashboardLayout title="Conversation" userType={userType}>
        <Card className="p-8 text-center">
          <h3 className="font-semibold">Conversation not found</h3>
          <Button 
            className="mt-4"
            onClick={() => navigate(`${basePath}/conversations`)}
          >
            Back to Conversations
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const { buyer, messages } = conversation;
  const scoreBreakdown = currentTier !== 'access' ? getScoreBreakdown(buyer) : null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    toast.success('Message sent', {
      description: `Your message to ${buyer.name} has been delivered.`,
    });
    setNewMessage('');
  };

  const handleBookViewing = () => {
    toast.success('Viewing request sent', {
      description: `Requesting viewing with ${buyer.name}...`,
    });
  };

  // AI suggested responses (Tier 3 only)
  const aiSuggestions = currentTier === 'enterprise' ? [
    "Thank you for your interest! I'd be happy to schedule a viewing at your convenience.",
    "The property features a modern open-plan layout with premium finishes throughout.",
    "Yes, we do have flexible payment plans available. Let me send you the details.",
  ] : [];

  return (
    <DashboardLayout title={buyer.name} userType={userType}>
      <div className="h-[calc(100vh-180px)] flex gap-6">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(`${basePath}/conversations`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className={cn(
                  buyer.score >= 80 ? "bg-amber-500/20 text-amber-600" : "bg-primary/10 text-primary"
                )}>
                  {getInitials(buyer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{buyer.name}</span>
                  {buyer.score >= 80 && currentTier === 'enterprise' && (
                    <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600">
                      <Zap className="h-2 w-2 mr-0.5" />
                      First Refusal
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {buyer.location} • Score: {buyer.score}
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-2",
                      message.sender === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}>
                      <span className="text-[10px] opacity-70">
                        {format(message.timestamp, 'HH:mm')}
                      </span>
                      {message.sender === 'user' && (
                        message.read 
                          ? <CheckCheck className="h-3 w-3 text-blue-400" />
                          : <Check className="h-3 w-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* AI Suggestions (Tier 3) */}
          {currentTier === 'enterprise' && aiSuggestions.length > 0 && (
            <div className="px-4 py-2 border-t bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className="text-[10px] text-muted-foreground">AI Suggested Responses</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {aiSuggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 shrink-0"
                    onClick={() => setNewMessage(suggestion)}
                  >
                    {suggestion.slice(0, 40)}...
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Buyer Profile Sidebar (Desktop) */}
        <Card className="w-80 hidden xl:block">
          <CardHeader>
            <CardTitle className="text-base">Buyer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span>{buyer.budget}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BedDouble className="h-4 w-4 text-muted-foreground" />
                <span>{buyer.bedrooms}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{buyer.timeline}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{buyer.paymentMethod}</span>
              </div>
            </div>

            <Separator />

            {/* Score Breakdown (Tier 2+) */}
            {scoreBreakdown && (
              <>
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    Score Breakdown
                    <Badge className="bg-primary/10 text-primary">{buyer.score}</Badge>
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(scoreBreakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="capitalize text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium">+{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Purpose & Areas */}
            <div>
              <h4 className="text-sm font-medium mb-2">Purpose</h4>
              <Badge variant="secondary">{buyer.purpose}</Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Preferred Areas</h4>
              <div className="flex flex-wrap gap-1">
                {buyer.preferredAreas.map((area, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <Button className="w-full" onClick={handleBookViewing}>
              <Calendar className="h-4 w-4 mr-2" />
              Book Viewing
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
