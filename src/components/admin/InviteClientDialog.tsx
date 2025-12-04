import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Building2, User, Briefcase, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InviteClientDialogProps {
  onClientInvited?: (client: InvitedClient) => void;
}

export interface InvitedClient {
  id: string;
  name: string;
  email: string;
  company: string;
  type: "developer" | "agent" | "broker";
  notes: string;
  invitedAt: Date;
  status: "pending" | "accepted" | "expired";
}

const InviteClientDialog = ({ onClientInvited }: InviteClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    type: "" as "developer" | "agent" | "broker" | "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.company || !formData.type) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call - in production this would send invitation email
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newClient: InvitedClient = {
      id: crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      company: formData.company,
      type: formData.type as "developer" | "agent" | "broker",
      notes: formData.notes,
      invitedAt: new Date(),
      status: "pending",
    };

    onClientInvited?.(newClient);

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${formData.email}`,
    });

    setFormData({ name: "", email: "", company: "", type: "", notes: "" });
    setIsSubmitting(false);
    setOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "developer":
        return <Building2 className="h-4 w-4" />;
      case "agent":
        return <User className="h-4 w-4" />;
      case "broker":
        return <Briefcase className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite New Client</DialogTitle>
          <DialogDescription>
            Send an invitation to onboard a new client to the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Contact Name *</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                placeholder="Berkeley Homes"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Client Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Property Developer
                    </div>
                  </SelectItem>
                  <SelectItem value="agent">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Estate Agent
                    </div>
                  </SelectItem>
                  <SelectItem value="broker">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Mortgage Broker
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this client..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteClientDialog;
