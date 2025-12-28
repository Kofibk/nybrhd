import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAirtableBuyersForTable } from '@/hooks/useAirtableBuyers';
import { useAirtableCampaigns } from '@/hooks/useAirtable';
import { Zap, Megaphone, Brain, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  onClick,
}) => (
  <Card 
    className="cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={onClick}
  >
    <CardContent className="p-4 flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", iconBg)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </CardContent>
  </Card>
);

interface QuickActionsProps {
  className?: string;
  userType: 'developer' | 'agent' | 'broker';
}

export const QuickActions: React.FC<QuickActionsProps> = ({ className, userType }) => {
  const navigate = useNavigate();
  const basePath = `/${userType}`;
  
  // Fetch real data
  const { buyers } = useAirtableBuyersForTable({ enabled: true });
  const { data: campaignsData } = useAirtableCampaigns({ filterByFormula: "{status} = 'active'" });
  
  const firstRefusalCount = buyers.filter(b => b.score >= 80).length;
  const activeCampaigns = campaignsData?.records?.length || 0;

  const handleExport = () => {
    toast.success('Generating report...', {
      description: 'Your data export will be ready shortly.',
    });
  };

  const actions: QuickActionProps[] = [
    {
      title: 'First Refusal',
      subtitle: `${firstRefusalCount} premium buyers`,
      icon: Zap,
      iconBg: 'bg-amber-500',
      onClick: () => navigate(`${basePath}/matches`),
    },
    {
      title: 'Campaigns',
      subtitle: `${activeCampaigns} active`,
      icon: Megaphone,
      iconBg: 'bg-pink-500',
      onClick: () => navigate(`${basePath}/campaigns`),
    },
    {
      title: 'AI Analysis',
      subtitle: 'Market insights',
      icon: Brain,
      iconBg: 'bg-purple-500',
      onClick: () => navigate(`${basePath}/insights`),
    },
    {
      title: 'Export Data',
      subtitle: 'Download reports',
      icon: Download,
      iconBg: 'bg-blue-500',
      onClick: handleExport,
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {actions.map((action, index) => (
        <QuickAction key={index} {...action} />
      ))}
    </div>
  );
};

export default QuickActions;
