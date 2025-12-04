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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateClientCampaignDialogProps {
  onCampaignCreated?: (campaign: CreatedCampaign) => void;
}

export interface CreatedCampaign {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  objective: string;
  budget: number;
  status: string;
  createdAt: string;
}

// Mock clients for selection
const mockClients = [
  { id: "1", name: "Berkeley Homes", type: "developer" },
  { id: "2", name: "Knight Frank", type: "agent" },
  { id: "3", name: "London & Country", type: "broker" },
  { id: "4", name: "Barratt Developments", type: "developer" },
  { id: "5", name: "Savills", type: "agent" },
];

const CreateClientCampaignDialog = ({ onCampaignCreated }: CreateClientCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    objective: "",
    budget: "",
    startDate: "",
    endDate: "",
    targetCountries: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.name || !formData.objective || !formData.budget) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const selectedClient = mockClients.find(c => c.id === formData.clientId);
    
    const newCampaign: CreatedCampaign = {
      id: `campaign-${Date.now()}`,
      name: formData.name,
      clientId: formData.clientId,
      clientName: selectedClient?.name || "",
      objective: formData.objective,
      budget: parseFloat(formData.budget),
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    onCampaignCreated?.(newCampaign);
    setIsSubmitting(false);
    setOpen(false);
    setFormData({
      clientId: "",
      name: "",
      objective: "",
      budget: "",
      startDate: "",
      endDate: "",
      targetCountries: "",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Client Campaign</DialogTitle>
          <DialogDescription>
            Create a new campaign on behalf of a client for managed service.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objective *</Label>
              <Select
                value={formData.objective}
                onValueChange={(value) => setFormData({ ...formData, objective: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="viewings">Viewings</SelectItem>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Q1 Lead Generation - London"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (£) *</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCountries">Target Countries</Label>
              <Input
                id="targetCountries"
                value={formData.targetCountries}
                onChange={(e) => setFormData({ ...formData, targetCountries: e.target.value })}
                placeholder="UK, UAE, Hong Kong"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any notes about this campaign..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientCampaignDialog;
