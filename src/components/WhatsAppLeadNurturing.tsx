import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WhatsAppChat from "./WhatsAppChat";
import { MessageCircle, Clock, CheckCircle, Calendar, TrendingUp, Settings } from "lucide-react";
import { useState } from "react";

interface Conversation {
  id: string;
  leadName: string;
  leadPhone: string;
  status: "active" | "pending" | "booked";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    text: string;
    timestamp: string;
    sender: "user" | "ai";
    status?: "sent" | "delivered" | "read";
    type?: "text" | "booking" | "property";
  }>;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    leadName: "James Okonkwo",
    leadPhone: "+234 801 234 5678",
    status: "booked",
    lastMessage: "Perfect! See you on Saturday at 2 PM.",
    lastMessageTime: "10:30 AM",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        text: "Hi! I saw your beautiful development in Victoria Island. Can you tell me more about the 3-bedroom units?",
        timestamp: "9:45 AM",
        sender: "user",
        status: "read",
      },
      {
        id: "2",
        text: "Hello James! 👋 Thank you for your interest in Victoria Gardens!\n\nWe have stunning 3-bedroom units available:\n• 180-200 sqm\n• Ocean views\n• Modern finishes\n• Starting from ₦85M\n\nWould you like to schedule a viewing?",
        timestamp: "9:47 AM",
        sender: "ai",
      },
      {
        id: "3",
        text: "Yes, that sounds great! When can I visit?",
        timestamp: "9:50 AM",
        sender: "user",
        status: "read",
      },
      {
        id: "4",
        text: "🗓️ I have the following slots available this week:\n\n• Thursday, 2:00 PM\n• Friday, 11:00 AM\n• Saturday, 2:00 PM\n\nWhich works best for you?",
        timestamp: "9:51 AM",
        sender: "ai",
        type: "booking",
      },
      {
        id: "5",
        text: "Saturday at 2 PM works perfectly for me.",
        timestamp: "10:15 AM",
        sender: "user",
        status: "read",
      },
      {
        id: "6",
        text: "✅ Viewing Confirmed!\n\nDate: Saturday, Nov 30\nTime: 2:00 PM\nLocation: Victoria Gardens Sales Gallery\n\nOur agent Sarah will meet you there. You'll receive a reminder 24 hours before.\n\nLooking forward to showing you your future home! 🏡",
        timestamp: "10:16 AM",
        sender: "ai",
        type: "booking",
      },
      {
        id: "7",
        text: "Perfect! See you on Saturday at 2 PM.",
        timestamp: "10:30 AM",
        sender: "user",
        status: "read",
      },
    ],
  },
  {
    id: "2",
    leadName: "Sarah Mitchell",
    leadPhone: "+44 7700 900123",
    status: "active",
    lastMessage: "Can you send me the floor plans?",
    lastMessageTime: "11:20 AM",
    unreadCount: 2,
    messages: [
      {
        id: "1",
        text: "Hello! I'm interested in investment properties in London.",
        timestamp: "10:45 AM",
        sender: "user",
        status: "read",
      },
      {
        id: "2",
        text: "Hi Sarah! 🏢 Great to hear from you!\n\nWe have excellent investment opportunities in prime London locations:\n\n📍 Canary Wharf\n• 1-2 bed apartments\n• 7.5% projected rental yield\n• From £450,000\n\n📍 King's Cross\n• Studio to 2 bed\n• 6.8% projected yield\n• From £380,000\n\nWhich area interests you most?",
        timestamp: "10:47 AM",
        sender: "ai",
        type: "property",
      },
      {
        id: "3",
        text: "Canary Wharf sounds interesting. What sizes are available?",
        timestamp: "11:15 AM",
        sender: "user",
        status: "read",
      },
      {
        id: "4",
        text: "Excellent choice! Canary Wharf units:\n\n🏠 1-Bedroom: 55-65 sqm, from £450k\n🏠 2-Bedroom: 75-85 sqm, from £625k\n\nAll include:\n• 24/7 concierge\n• Gym & pool\n• River views\n• 10 min to Canary Wharf station\n\nI can send you detailed floor plans and a virtual tour. Interested?",
        timestamp: "11:18 AM",
        sender: "ai",
      },
      {
        id: "5",
        text: "Can you send me the floor plans?",
        timestamp: "11:20 AM",
        sender: "user",
        status: "delivered",
      },
    ],
  },
  {
    id: "3",
    leadName: "Ahmed Al-Rashid",
    leadPhone: "+971 50 123 4567",
    status: "pending",
    lastMessage: "AI: When would you like to visit the development?",
    lastMessageTime: "Yesterday",
    unreadCount: 1,
    messages: [
      {
        id: "1",
        text: "I'm looking for luxury waterfront properties in Dubai.",
        timestamp: "Yesterday 4:30 PM",
        sender: "user",
        status: "read",
      },
      {
        id: "2",
        text: "Welcome Ahmed! 🌟\n\nWe have spectacular waterfront developments:\n\n🏖️ Dubai Marina Premium\n• 3-4 bedroom penthouses\n• Private beach access\n• From AED 8M\n\n🏖️ Palm Jumeirah Residences\n• 2-3 bedroom apartments\n• Full sea views\n• From AED 5.5M\n\nBoth offer world-class amenities and guaranteed ROI. Which catches your eye?",
        timestamp: "Yesterday 4:32 PM",
        sender: "ai",
        type: "property",
      },
      {
        id: "3",
        text: "The Palm Jumeirah sounds perfect. Tell me more.",
        timestamp: "Yesterday 5:15 PM",
        sender: "user",
        status: "read",
      },
      {
        id: "4",
        text: "Excellent taste! 🌴\n\nPalm Jumeirah Residences highlights:\n• 180-250 sqm living space\n• Floor-to-ceiling windows\n• Private balconies with sea views\n• Infinity pool & spa\n• Michelin-star restaurant on-site\n• 5-year payment plan available\n\nWhen would you like to visit the development?",
        timestamp: "Yesterday 5:18 PM",
        sender: "ai",
      },
    ],
  },
];

const WhatsAppLeadNurturing = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    mockConversations[0]
  );

  const stats = [
    { label: "Active Conversations", value: "24", icon: MessageCircle, color: "text-blue-500" },
    { label: "Avg Response Time", value: "< 2 min", icon: Clock, color: "text-green-500" },
    { label: "Bookings This Week", value: "12", icon: Calendar, color: "text-purple-500" },
    { label: "Conversion Rate", value: "34%", icon: TrendingUp, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Interface */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Conversations</h3>
            <Button size="icon" variant="ghost">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="booked">Booked</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {mockConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{conv.leadName}</div>
                    <div className="text-xs text-muted-foreground">{conv.lastMessageTime}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={
                        conv.status === "booked"
                          ? "default"
                          : conv.status === "active"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {conv.status === "booked" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {conv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-2">
              {mockConversations
                .filter((c) => c.status === "active")
                .map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="font-medium">{conv.leadName}</div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="booked" className="space-y-2">
              {mockConversations
                .filter((c) => c.status === "booked")
                .map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="font-medium">{conv.leadName}</div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Chat Window */}
        <div className="md:col-span-2">
          {selectedConversation ? (
            <WhatsAppChat
              leadName={selectedConversation.leadName}
              leadPhone={selectedConversation.leadPhone}
              messages={selectedConversation.messages}
            />
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* AI Automation Info */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered Automation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI assistant automatically responds to leads 24/7, answers property questions,
              shares listings, and schedules viewings - converting leads while you sleep.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Instant responses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Smart booking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Multilingual support</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WhatsAppLeadNurturing;
