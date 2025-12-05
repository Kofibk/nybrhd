import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MetaCampaignBuilderProps {
  onCampaignCreated?: (campaign: any) => void;
  onClose?: () => void;
}

const MetaCampaignBuilder = ({ onCampaignCreated, onClose }: MetaCampaignBuilderProps) => {
  const [developmentName, setDevelopmentName] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = () => {
    if (!developmentName || !budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    const campaign = {
      id: `mc-${Date.now()}`,
      developmentName,
      objective: "leads",
      phase: "testing",
      regions: ["uk"],
      countries: ["GB"],
      cities: [],
      budget: parseFloat(budget),
      startDate: new Date().toISOString().split("T")[0],
      whatsappEnabled: true,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    onCampaignCreated?.(campaign);
    toast.success("Campaign created successfully!");
    onClose?.();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="development">Development Name *</Label>
        <Input
          id="development"
          placeholder="e.g., Riverside Towers"
          value={developmentName}
          onChange={(e) => setDevelopmentName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget (£) *</Label>
        <Input
          id="budget"
          type="number"
          placeholder="5000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Create Campaign</Button>
      </div>
    </div>
  );
};

export default MetaCampaignBuilder;
