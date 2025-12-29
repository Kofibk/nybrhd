import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Wallet, 
  BedDouble,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useMyAssignments, useMyContactHistory } from '@/hooks/useBuyerAssignments';
import { useAirtableBuyersForTable } from '@/hooks/useAirtableData';
import { cn } from '@/lib/utils';
import RequestIntroductionModal from '@/components/RequestIntroductionModal';

interface AssignedLead {
  assignmentId: string;
  airtableRecordId: string;
  status: string;
  assignedAt: string;
  notes: string | null;
  // Buyer data from Airtable
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  budget?: string;
  bedrooms?: string;
  timeline?: string;
  score?: number;
  contacted?: boolean;
  lastContactedAt?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  assigned: { 
    label: 'New', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: <AlertCircle className="h-3 w-3" /> 
  },
  contacted: { 
    label: 'Contacted', 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: <Mail className="h-3 w-3" /> 
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: <Clock className="h-3 w-3" /> 
  },
  converted: { 
    label: 'Converted', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: <CheckCircle className="h-3 w-3" /> 
  },
};

export const MyAssignedLeads: React.FC = () => {
  const { data: assignments, isLoading: loadingAssignments, refetch } = useMyAssignments();
  const { buyers, isLoading: loadingBuyers } = useAirtableBuyersForTable();
  const { data: contactHistory } = useMyContactHistory();
  
  const [selectedBuyer, setSelectedBuyer] = useState<AssignedLead | null>(null);
  const [showIntroModal, setShowIntroModal] = useState(false);

  // Merge assignments with buyer data
  const assignedLeads = useMemo<AssignedLead[]>(() => {
    if (!assignments) return [];
    
    return assignments.map(assignment => {
      // Find matching buyer in Airtable data
      const buyer = buyers.find(b => b.id === assignment.airtable_record_id);
      
      // Check if this buyer was contacted
      const contacts = contactHistory?.filter(c => c.airtable_record_id === assignment.airtable_record_id) || [];
      const lastContact = contacts[0]; // Already sorted by contacted_at desc
      
      return {
        assignmentId: assignment.id,
        airtableRecordId: assignment.airtable_record_id,
        status: assignment.status || 'assigned',
        assignedAt: assignment.assigned_at,
        notes: assignment.notes,
        // Buyer data from transformed record
        name: buyer?.name || 'Unknown Buyer',
        email: buyer?.email,
        phone: buyer?.phone,
        location: buyer?.location,
        budget: buyer?.budgetRange,
        bedrooms: buyer?.bedrooms,
        timeline: buyer?.timeline,
        score: buyer?.score,
        contacted: contacts.length > 0,
        lastContactedAt: lastContact?.contacted_at,
      };
    });
  }, [assignments, buyers, contactHistory]);

  const isLoading = loadingAssignments || loadingBuyers;

  const handleContactClick = (lead: AssignedLead) => {
    setSelectedBuyer(lead);
    setShowIntroModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Assigned Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assignedLeads.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Assigned Leads
          </CardTitle>
          <CardDescription>
            Leads assigned to you will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No leads assigned yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              When your admin assigns leads to you, they'll appear here for you to contact and nurture.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Assigned Leads
            </CardTitle>
            <CardDescription>
              {assignedLeads.length} lead{assignedLeads.length !== 1 ? 's' : ''} assigned to you
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignedLeads.map(lead => {
              const statusInfo = statusConfig[lead.status] || statusConfig.assigned;
              
              return (
                <div 
                  key={lead.assignmentId}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold shrink-0">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  
                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{lead.name}</h3>
                      {lead.score !== undefined && (
                        <Badge 
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            lead.score >= 80 ? 'bg-amber-500 text-white' :
                            lead.score >= 70 ? 'bg-green-500 text-white' :
                            lead.score >= 50 ? 'bg-blue-500 text-white' :
                            'bg-muted'
                          )}
                        >
                          {lead.score}
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn('text-xs gap-1', statusInfo.color)}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      {lead.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.location}
                        </span>
                      )}
                      {lead.budget && (
                        <span className="flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          {lead.budget}
                        </span>
                      )}
                      {lead.bedrooms && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3 w-3" />
                          {lead.bedrooms}
                        </span>
                      )}
                      {lead.timeline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lead.timeline}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Assigned {formatDate(lead.assignedAt)}
                      {lead.contacted && lead.lastContactedAt && (
                        <span className="ml-2 text-green-600">
                          • Last contacted {formatDate(lead.lastContactedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {lead.phone && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9"
                        asChild
                      >
                        <a href={`tel:${lead.phone}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleContactClick(lead)}
                      className="gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Contact
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Introduction Modal */}
      <RequestIntroductionModal
        isOpen={showIntroModal}
        onClose={() => {
          setShowIntroModal(false);
          setSelectedBuyer(null);
        }}
        buyer={selectedBuyer ? {
          id: selectedBuyer.airtableRecordId,
          name: selectedBuyer.name,
          location: selectedBuyer.location || 'Unknown',
          budget: selectedBuyer.budget || 'Unknown',
          bedrooms: selectedBuyer.bedrooms || 'Unknown',
          timeline: selectedBuyer.timeline || 'Unknown',
          score: selectedBuyer.score || 0,
          email: selectedBuyer.email,
          phone: selectedBuyer.phone,
        } : null}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
};

export default MyAssignedLeads;
