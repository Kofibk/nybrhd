import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  BarChart3,
  Upload,
  Plus,
  Search,
  FolderOpen,
  Inbox,
  Calendar,
  Target,
  Megaphone,
} from 'lucide-react';

interface EmptyStateProps {
  type: 'leads' | 'campaigns' | 'conversations' | 'matches' | 'analytics' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

const emptyStateConfig = {
  leads: {
    icon: Users,
    title: 'No leads yet',
    description: 'Upload your lead data or connect your ad accounts to start seeing leads here.',
    actionLabel: 'Upload Leads',
    secondaryLabel: 'Connect Ads',
  },
  campaigns: {
    icon: Megaphone,
    title: 'No campaigns found',
    description: 'Create your first campaign to start generating leads and tracking performance.',
    actionLabel: 'Create Campaign',
    secondaryLabel: 'Upload Data',
  },
  conversations: {
    icon: MessageSquare,
    title: 'No conversations yet',
    description: 'Start engaging with your leads to see conversation history here.',
    actionLabel: 'View Leads',
    secondaryLabel: null,
  },
  matches: {
    icon: Target,
    title: 'No buyer matches',
    description: 'Upload your inventory or connect your listings to find matching buyers.',
    actionLabel: 'Add Inventory',
    secondaryLabel: 'Import Listings',
  },
  analytics: {
    icon: BarChart3,
    title: 'No data to display',
    description: 'Upload campaign and lead data to see performance analytics.',
    actionLabel: 'Upload Data',
    secondaryLabel: null,
  },
  general: {
    icon: FolderOpen,
    title: 'Nothing here yet',
    description: 'Get started by adding some data or connecting your accounts.',
    actionLabel: 'Get Started',
    secondaryLabel: null,
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-lg border-2 border-dashed border-border bg-muted/20",
      className
    )}>
      <div className="p-4 rounded-full bg-muted/50 mb-4">
        <Icon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {title || config.title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description || config.description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {onAction && (
          <Button onClick={onAction}>
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel || config.actionLabel}
          </Button>
        )}
        
        {onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            <Upload className="h-4 w-4 mr-2" />
            {secondaryActionLabel || config.secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12",
      className
    )}>
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-muted animate-pulse" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this content. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-lg border border-destructive/20 bg-destructive/5",
      className
    )}>
      <div className="p-3 rounded-full bg-destructive/10 mb-4">
        <svg 
          className="h-8 w-8 text-destructive" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
