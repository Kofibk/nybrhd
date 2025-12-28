import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAssignBuyer } from '@/hooks/useBuyerAssignments';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, User } from 'lucide-react';

interface AssignBuyerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: {
    id: string;
    leadId?: number;
    name: string;
    score?: number;
  } | null;
  onAssigned?: () => void;
}

export const AssignBuyerDialog: React.FC<AssignBuyerDialogProps> = ({
  isOpen,
  onClose,
  buyer,
  onAssigned,
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');
  
  const assignBuyer = useAssignBuyer();
  
  // Fetch users from profiles table
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['profiles', 'assignable-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, company_id')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });
  
  const handleAssign = async () => {
    if (!buyer || !selectedUserId) return;
    
    try {
      const selectedUser = users?.find(u => u.user_id === selectedUserId);
      
      await assignBuyer.mutateAsync({
        airtableRecordId: buyer.id,
        airtableLeadId: buyer.leadId,
        userId: selectedUserId,
        companyId: selectedUser?.company_id || undefined,
        notes: notes || undefined,
      });
      
      toast.success(`${buyer.name} assigned to ${selectedUser?.full_name || selectedUser?.email}`);
      onAssigned?.();
      handleClose();
    } catch (error: any) {
      console.error('Error assigning buyer:', error);
      toast.error(error.message || 'Failed to assign buyer');
    }
  };
  
  const handleClose = () => {
    setSelectedUserId('');
    setNotes('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Buyer</DialogTitle>
        </DialogHeader>
        
        {buyer && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{buyer.name}</p>
                {buyer.score !== undefined && (
                  <p className="text-sm text-muted-foreground">Score: {buyer.score}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Assign to User</Label>
              {loadingUsers ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading users...
                </div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                rows={3}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedUserId || assignBuyer.isPending}
          >
            {assignBuyer.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Buyer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignBuyerDialog;
