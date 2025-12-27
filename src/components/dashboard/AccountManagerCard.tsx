import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { accountManager } from '@/lib/buyerData';
import { Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountManagerCardProps {
  className?: string;
}

export const AccountManagerCard: React.FC<AccountManagerCardProps> = ({ className }) => {
  const handleCall = () => {
    window.location.href = `tel:${accountManager.phone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${accountManager.email}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${accountManager.whatsapp.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <Card className={cn(
      "bg-gradient-to-r from-primary/5 via-primary/10 to-purple-500/10 border-primary/20",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {accountManager.avatar}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">{accountManager.name}</h3>
              <Badge variant="secondary" className="text-[10px]">
                Your Account Manager
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{accountManager.title}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {accountManager.availability}
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none h-9"
              onClick={handleCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none h-9"
              onClick={handleEmail}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button 
              size="sm" 
              className="flex-1 sm:flex-none h-9 bg-green-600 hover:bg-green-700"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountManagerCard;
