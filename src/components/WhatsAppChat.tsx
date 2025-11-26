import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: "user" | "ai";
  status?: "sent" | "delivered" | "read";
  type?: "text" | "booking" | "property";
}

interface WhatsAppChatProps {
  leadName: string;
  leadPhone: string;
  messages: Message[];
  onSendMessage?: (message: string) => void;
}

const WhatsAppChat = ({ leadName, leadPhone, messages, onSendMessage }: WhatsAppChatProps) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (inputMessage.trim() && onSendMessage) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <Card className="flex flex-col h-[600px] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{leadName}</div>
            <div className="text-xs text-muted-foreground">{leadPhone}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost">
            <Phone className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Video className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "ai" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "ai"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.type === "booking" && (
                  <div className="mb-2">
                    <Badge variant="secondary" className="mb-2">
                      Booking Confirmation
                    </Badge>
                  </div>
                )}
                {message.type === "property" && (
                  <div className="mb-2">
                    <Badge variant="secondary" className="mb-2">
                      Property Details
                    </Badge>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                  {message.sender === "user" && (
                    <span>
                      {message.status === "read" ? (
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      ) : message.status === "delivered" ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WhatsAppChat;
