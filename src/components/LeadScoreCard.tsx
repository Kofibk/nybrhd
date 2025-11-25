import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, User, Mail, Phone, MapPin } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileScore: number;
  intentScore: number;
  status: "new" | "qualified" | "viewing" | "offer";
  source: string;
}

interface LeadScoreCardProps {
  lead: Lead;
}

const LeadScoreCard = ({ lead }: LeadScoreCardProps) => {
  const totalScore = (lead.profileScore + lead.intentScore) / 2;
  
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "default";
      case "qualified": return "secondary";
      case "viewing": return "default";
      case "offer": return "default";
      default: return "default";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{lead.name}</h3>
          <Badge variant={getStatusColor(lead.status)} className="capitalize">
            {lead.status}
          </Badge>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
            {totalScore.toFixed(0)}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Total Score
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Profile Score</span>
            <span className="font-medium">{lead.profileScore}%</span>
          </div>
          <Progress value={lead.profileScore} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Intent Score</span>
            <span className="font-medium">{lead.intentScore}%</span>
          </div>
          <Progress value={lead.intentScore} className="h-2" />
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {lead.email}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {lead.phone}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {lead.location}
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Source: {lead.source}
        </div>
      </div>
    </Card>
  );
};

export default LeadScoreCard;
